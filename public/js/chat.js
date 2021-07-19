// const socket = io() // on calling io, a new connection is established

// Events can be received by the receiver using on.
// client can see the message on the console of the browser or server
// socket.on('countUpdated', (count) => {
//     console.log("Count has been updated! ", count) 
// })

// // communication from client to server
// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('clicked')
//     socket.emit('incrementevent')  
// })

const socket = io()

// Elements - $ symbol is added just for us to realize that these are DOM elements, $ is not a standard or compulsory thing
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// templates
const messageTemplate = document.querySelector("#message-template").innerHTML // it will get the div and p tags
const locationTemplate = document.querySelector("#location-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

// options
// if you type in console: location.search => output: "?username=hey&room=aaaa" which is got from url
// qs javascript library is used for parsing query string which parses the above string into an object which has username and room properties
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true}) // ignorequeryprefix removes the ? in front of username property


const autoScroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the last or new message
    // const newMessageHeight = $newMessage.offsetHeight // this doesn't take margin spaces under consideration so actual height including margin is not obtained, for which we have to get its styling properties
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    // console.log(newMessageStyles)
    // console.log(newMessageMargin)
    // console.log(newMessageHeight)

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of message container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on("messageClient", (msg) => { 
    console.log(msg)

    // delivering the template
    // Mustache is a JavaScript library, which can be referenced from a CDN (Content Delivery Network).
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        message: msg.text,
        // createdAt: msg.createdAt  //displays timestamp but this is a large number which is not understandable
        createdAt: moment(msg.createdAt).format("HH:mm a")     // for formatting time in the way we want, we can use moment.js library
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
}) 

socket.on("locationMessage", (loc) => {
    console.log(loc)

    const html = Mustache.render(locationTemplate, {
        username: loc.username,
        url: loc.url,
        createdAt: moment(loc.createdAt).format("HH:mm a")
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on("roomData", ({ room, users }) => {
    // console.log(room)
    // console.log(users)
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.querySelector("#sidebar").innerHTML = html
})
// document.querySelector('#message-form').addEventListener('submit', (e) => {
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault() // default action of page: refresh and reset the value, if this happens the user cannot see his own typed value when he click submit
    // we use this function to prevent the defaults

    // disables the form when it is submitted
    $messageFormButton.setAttribute('disabled', 'disabled') // attribute name is diabled and its value is also disabled
    // const message = document.querySelector('input').value
    //const message = e.target.elements['msgfield'].value // target points to the form from which the element with name msgfield is selected and its value is placed in message
    const message = e.target.msgfield.value  // alternate way
    // socket.emit('messageFromClient', message)

    // sending an acknowledgement as well
    socket.emit('messageFromClient', message, (error) => {
        // re-enabling the button after sending the message to connected clients regardless of whether we get an error or not
        $messageFormButton.removeAttribute('disabled')

        // clearing the field once the message has been sent
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }
        console.log("Message delivered!")
    })

}) 

// document.querySelector("#send-location").addEventListener('click', () => {
$locationButton.addEventListener('click', () => {

    if(!navigator.geolocation){
        return alert("Geolocation is not supported by the browser!")
    }

    // disabling the button while processing
    $locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        // console.log(position)
        // console.log(position.coords.latitude)
        // console.log(position.coords.longitude)

        socket.emit('sendLocation', { 
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude
        }, () => {
            // re-enabling the button once the location has been sent
            $locationButton.removeAttribute('disabled')
            console.log("Location shared!")
        })
    })
})

socket.emit("joinRoom", { username, room }, (error) => {
    if(error){
        alert(error)
        // reload back to same page to join 
        location.href = "/"
    }
})
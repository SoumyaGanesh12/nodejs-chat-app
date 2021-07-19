const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('../src/utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('../src/utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

// io.on('connection', () => {
//     console.log('New web socket connection')  
//     // if we type localhost:3000 in browser, the console message is not printed because the browser connection is not considered as a client connection
//     // so in html we include script tag for access to client side javascript library of socket.io and our javascript file for setting up the client connection
// })


// server(emit) -> client(recieve) -- countUpdated
// client(emit) -> server(recieve) -- incrementevent

// let count = 0
// io.on('connection', (socket) => {
//     console.log('New web socket connection')  
//     // Events can be sent from the sender using emit. 
//     socket.emit('countUpdated', count) // name of the event, value to the callback function

//     socket.on('incrementevent', () => {
//         count++
//         // socket.emit('countUpdated', count) // this emits event to that specific connection
//         // if we open one more connection the count value must be updated and must be visible for both the clients
//         io.emit('countUpdated', count) // this one emits the event to every single connection
//     })
// })

// sending welcome message from server to client
io.on('connection', (socket) => {
    console.log("New web socket connection")
    // socket.emit("messageClient", "Welcome!")
    // socket.emit("messageClient", generateMessage("Welcome!"))

    // when a new user is joining everyone in the chat room must get a message that a new user has joined, except the new user who has joined now
    // socket.broadcast.emit("messageClient", "A new user has joined!")
    // socket.broadcast.emit("messageClient", generateMessage("A new user has joined!"))


    // socket.on('messageFromClient', (message) => {
    //     io.emit("messageClient", message)
    // })

    // to recieve the acknowledgement
    // socket.on('messageFromClient', (message, callback) => {
    //     io.emit("messageClient", message) 
    //     callback('Delivered')
    // })

    // joining a room
    // socket.on("joinRoom", ({ username, room }, callback) => {
    //     // socket.id is a unique value for each socket connection
    //     const {error, user} = addUser({ id: socket.id, username, room})
    // OR using Rest API approach
    socket.on("joinRoom", (options, callback) => {
        // socket.id is a unique value for each socket connection
        const {error, user} = addUser({ id: socket.id, ...options})

        if(error){
            return callback(error)
        }

        // socket.join(room)  // to join a specific room
        socket.join(user.room)
        socket.emit("messageClient", generateMessage("Admin", "Welcome!"))
        // socket.broadcast.emit("messageClient", generateMessage("A new user has joined!"))
        // socket.broadcast.to(room).emit("messageClient", generateMessage(`${username} has joined!`))
        // 'this particular user has joined' this message will be send only to people in that room and not to everybody, for that we added the to() function which takes in the room parameter 
        socket.broadcast.to(user.room).emit("messageClient", generateMessage("Admin", `${user.username} has joined!`))
        
        // the list of users in room changes when a new user joins the group or when someone leaves the room
        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    // server screens for usage of profane language
    socket.on('messageFromClient', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback("Profanity is not allowed!")
        }

        // io.emit("messageClient", message) 
        // io.to('room 1').emit("messageClient", generateMessage(message)) 
        io.to(user.room).emit("messageClient", generateMessage(user.username, message)) 
        callback()
    })

    socket.on("sendLocation", (position, callback) => {
        // io.emit("messageClient", `Location: ${position.latitude}, ${position.longitude}`)
        // io.emit("locationMessage", `https://google.com/maps?q=${position.latitude},${position.longitude}`)
        // io.emit("locationMessage", generateLocationMessage(`https://google.com/maps?q=${position.latitude},${position.longitude}`))
        
        const user = getUser(socket.id)
        io.to(user.room).emit("locationMessage", generateLocationMessage(user.username, `https://google.com/maps?q=${position.latitude},${position.longitude}`))
        callback()

    })

    // when a user disconnects, all other users are notified that a person has left
    // "connection" and "disconnect" are inbuilt event names, they will be handled by socket.io
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit("messageClient", generateMessage("Admin", `${user.username} has left!`))
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
        // io.emit("messageClient", "A user has left!") // as the user has already left, there is no need to broadcast
        // io.emit("messageClient", generateMessage("A user has left!"))
    })
})

// app.listen(port, () => {
//     console.log(`Server is up and running in port ${port}! `)
// })

server.listen(port, () => {
    console.log(`Server is up and running in port ${port}! `)
})
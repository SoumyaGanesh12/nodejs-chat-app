const users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({id, username, room}) => {
    // clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate the data
    if(!username || !room){
        return{
            error: 'Username and room are required!'
        }
    }

    // check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // validate username
    if(existingUser){
        return{
            error: 'Username already in use!'
        }
    }

    // store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index =  users.findIndex((user) => user.id === id)

    if(index!==-1){
        return users.splice(index, 1)[0] 
        // The .splice() method returns an array of elements that were deleted from the original array so the [0] afterward is just accessing the first element of the returned elements.
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

// addUser({
//     id: 22,
//     username: "Sou   ",
//     room: "room 1"
// })

// addUser({
//     id: 32,
//     username: "Lara",
//     room: "room 1"
// })

// addUser({
//     id: 42,
//     username: "Abi",
//     room: "room 2"
// })

// console.log(users)

// const res= addUser({
//     id: 33,
//     username: 'sou ',
//     room: 'room 1'
// })
// console.log(res)

// const removedUser = removeUser(22)
// console.log(removedUser)
// console.log(users)

// console.log(getUser(22))
// console.log(getUser(26))

// console.log(getUsersInRoom('room 1'))
// console.log(getUsersInRoom('room 4'))

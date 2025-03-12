# Chat Application - WebSocket Server

This is a Node.js-based chat application that utilizes WebSockets (Socket.io) to enable real-time communication between users in different chat rooms.

## Features
- Real-time messaging using WebSockets
- Room-based communication
- User join and leave notifications
- Profanity filter to prevent inappropriate messages
- Location sharing feature

## Installation

1. Clone the repository:
   ```sh
   git clone <repository_url>
   ```
2. Navigate to the project directory:
   ```sh
   cd <project_directory>
   ```
3. Install dependencies:
   ```sh
   npm install
   ```

## Running the Server

To start the server, run:
```sh
node server.js
```
Or, if using nodemon:
```sh
nodemon server.js
```
The server will start on `http://localhost:3000` unless another port is specified in the environment variables.

## Project Structure
```
├── public/                   # Static files (Frontend UI)
├── src/
│   ├── utils/
│   │   ├── messages.js       # Message formatting utilities
│   │   ├── users.js          # User management functions
├── server.js                 # Main server file
├── package.json              # Project dependencies and scripts
└── README.md                 # Documentation
```

## WebSocket Events
### Server to Client
- `messageClient` - Sends messages to clients in the chat room.
- `roomData` - Updates the room data when users join or leave.
- `locationMessage` - Sends location URLs shared by users.

### Client to Server
- `joinRoom` - A user joins a specific chat room.
- `messageFromClient` - Sends a chat message (filtered for profanity).
- `sendLocation` - Sends a user's location.
- `disconnect` - Notifies others when a user leaves.

## Technologies Used
- **Node.js** - Backend runtime environment
- **Express.js** - Web framework for handling static files
- **Socket.io** - Real-time communication
- **bad-words** - Profanity filtering



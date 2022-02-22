
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const cors = require('cors');
const path = require('path');



const io = require("socket.io")(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: [ "GET", "POST" ]
	}
})


app.use(cors());




let onlineUsers = [];

const addNewUser = (username, socketId) => {
    !onlineUsers.some((user) => user.username === username) &&
    onlineUsers.push({ username, socketId });
};

const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
  };


io.on('connection', socket => {

    socket.on("newUser", (username) => {
        addNewUser(username, socket.id);
        io.sockets.emit("onlineUsers", onlineUsers);
        socket.emit('yourID', socket.id);
      });
      
    socket.on('disconnect', () => {
        removeUser(socket.id);
        io.sockets.emit("remainingUsers", onlineUsers);
    })

    socket.on("callUser", (data) => {
        io.to(data.userToCall).emit('hey', {signal: data.signalData, from: data.from, name: data.name});
    })

    socket.on("acceptCall", (data) => {
        io.to(data.to).emit('callAccepted', data.signal);
    })

    socket.on('endCall', () => {
        io.emit('callEnded')
    })

    socket.on('rejectCall', () => {
        io.emit('rejected')
    })


});

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'))
}

const port = process.env.PORT || 8000;

server.listen(port, () => console.log('server is running on port 8000'));
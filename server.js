const express = require("express");
const connectDB = require("./config/db");
require('dotenv').config()
var cors = require('cors')
const { chats } = require("./data/data");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

connectDB()

const app = express()
app.use(cors())
 app.use(express.json())
 
app.get("/",(req,res)=>{
    res.send("api is running successfully")
})


app.use("/api/user",userRoutes)
app.use("/api/chat",chatRoutes)
app.use("/api/message",messageRoutes)

app.use(notFound)
app.use(errorHandler)

const server = app.listen(process.env.PORT || 5000,()=> {
    console.log("server is running on port 5000".yellow.bold)
})

const io = require('socket.io')(server,{
    pingTimeout: 120000,
    cors:{
        origin: "http://localhost:3000",
    }
})

io.on("connection",(socket) => {
    console.log("connected to socket.io");

    socket.on("setup",(userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat",(room)=>{
        socket.join(room);
        console.log("user joined room: " + room);
    })

    socket.on("typing",(room) => socket.in(room).emit("typing"));
    socket.on("stop typing",(room) => socket.in(room).emit("stop typing"));

    socket.on("new message",(newMessageReceived) => {
        var chat = newMessageReceived.chat;

        if(!chat.users) return console.log("chat.users not found");

        chat.users.forEach((user) => {
            if(user._id == newMessageReceived.sender._id) return;

            socket.in(user._id).emit("message received", newMessageReceived);
        });
    });

    socket.off("setup",()=> {
        console.log("user Disconnected");
        socket.leave(userData._id)
    })

});




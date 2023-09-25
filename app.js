const express = require("express")
const app = express()
const router = require("./router/mainRouter")
const mongoose = require("mongoose")
const cors = require("cors")
const {createServer} = require('node:http')
const {Server}= require('socket.io')

require("dotenv").config()
const server = createServer(app)
const io = new Server(server,{
    cors: {
        origin: "http://localhost:3000"
    }
})

io.on ("connection", (socket) =>{
    console.log("a user connected")
})

server.listen (3001,()=> {
    console.log("server running at http://localhost:3001")
})

mongoose.connect(process.env.DB_KEY)
    .then (()=> {
        console.log("connect success")
    }).catch (e=> {
    console.log('Error', e)
})

app.use(cors())
app.use(express.json())
app.use("/",router)
const port = 8000
app.listen(port)

const jwt = require("jsonwebtoken")



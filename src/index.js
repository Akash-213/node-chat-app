const path = require('path')
const http = require('http')
const express = require('express')
const socketio =require('socket.io')
const {generateMessage ,generatelocationmsg} = require('../src/utils/messages')
const {addUser , removeUser ,getUser ,getUsersinRoom} =require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port  =process.env.PORT || 3000
const publicDirectorypath = path.join(__dirname , '../public')

app.use(express.static(publicDirectorypath))


io.on('connection' ,(socket)=>{
    console.log('New WebSocket connection !!')

    socket.on('join' ,({username , room} , callback)=> {

        const { error ,user} =addUser({ id : socket.id ,username ,room})
        
        if(error){
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('message' , generateMessage('Admin' ,'Welcome!!'))
        socket.broadcast.to(user.room).emit('message' ,generateMessage('Admin' ,`${user.username} has joined!!`))
        
        io.to(user.room).emit('roomData' ,{
            room :user.room ,
            users : getUsersinRoom(user.room)
        })
        callback()

    })
    
    socket.on('SendMessage' , (message ,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('message' ,generateMessage(user.username ,message))
        callback()
       
    })

    socket.on('send-location' ,(coords ,callback)=>{
        const user = getUser(socket.id)
        io.emit('locationMessage' , generatelocationmsg(user.username ,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
 
    })

    

    socket.on('disconnect' ,()=>{
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message' , generateMessage('Admin' ,`${user.username} has left !!  `))
            io.to(user.room).emit('roomData' ,{
                room :user.room ,
                users : getUsersinRoom(user.room)
            })
        }

    })
})

server.listen(port , ()=>{
    console.log(`Server is up on ${port}!!`)
})


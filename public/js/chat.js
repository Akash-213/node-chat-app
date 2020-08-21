const socket = io()


//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendlocationbutton = document.querySelector('#location-button')
const $messages = document.querySelector("#messages")

//templates
const messagetemplate = document.querySelector('#message-template').innerHTML
const locationmessagetemplate =document.querySelector('#location-template').innerHTML
const sidebar_template =document.querySelector('#sidebar-template').innerHTML

//Options
const {username ,room} = Qs.parse(location.search, {ignoreQueryPrefix :true})


const autoscroll =() =>{
    //New message
    const $newMessage = $messages.lastElementChild

    //Height of new messages

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight +newMessageMargin

    //Visible Height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far scrolled
    const scrolloffset =$messages.scrollTop +visibleHeight

    if(containerHeight - newMessageHeight  <= scrolloffset) {
        $messages.scrollTop =$messages.scrollHeight
    }
}
socket.on('message' ,(message) =>{
    console.log(message)

    const html = Mustache.render(messagetemplate,{
        username : message.username ,
        message:message.text ,
        createdAt:moment(message.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)

    autoscroll()
})

socket.on('locationMessage' ,(message)=>{
    console.log(message)

    const html = Mustache.render(locationmessagetemplate ,{
        username: message.username ,
        url:message.url ,
        createdAt : moment(message.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData' ,({ room ,users}) =>{
    const html = Mustache.render(sidebar_template ,{
        room ,
        users
    })
    document.querySelector('#sidebar').innerHTML =html
})

$messageForm.addEventListener('submit' ,(e)=>{
        e.preventDefault()
        //disables the form
        $messageFormButton.setAttribute('disabled' ,'disabled')

        // const message = document.querySelector('input').value
        const message = e.target.elements.Message.value
        socket.emit('SendMessage' , message ,()=>{
        //enble the form again
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = '' //erases the previous
        $messageFormInput.focus() //cursor in input
        console.log("Message delivered !!")

        })
})

$sendlocationbutton.addEventListener('click' ,()=>{

    if(!navigator.geolocation){
        return alert("Geolocation not supported on your version")
    }
    $sendlocationbutton.setAttribute('disabled' ,'disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('send-location' ,{
            latitude : position.coords.latitude ,
            longitude : position.coords.longitude
        } ,()=>{
            $sendlocationbutton.removeAttribute('disabled')
            console.log("Location shared !!")
        })
    })
})

socket.emit('join',{username ,room} ,(error)=>{
    if(error){
        alert(error)
        location.href ='/'
    }
})



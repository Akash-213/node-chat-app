const generateMessage = (username ,text)=>{

    return {
        username :username ,
        text:text ,
        createdAt: new Date().getTime()
    }
}
const generatelocationmsg = (username ,url)=>{

    return{
        username : username ,
        url : url ,
        createdAt :new Date().getTime()
    }
}

module.exports ={
    generateMessage,
    generatelocationmsg
}
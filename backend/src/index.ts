import {WebSocketServer, WebSocket} from "ws"
import 'dotenv/config'

//@ts-ignore
const wss = new WebSocketServer({port:process.env.PORT||undefined});

let userCount = 0;
interface User {
    socket: WebSocket;
    room: string;
    ip: string;
}

interface MessageDetail {
    type: string,
    payload: {
        message: string,
        room: string,
    },
    ip: string
}

let allSockets:User[] = [];

wss.addListener("connection",(socket)=>{
    
    socket.on("message", async (ev)=>{
        const parsedMessage: MessageDetail = JSON.parse(ev.toString());

        try{
            if(parsedMessage.type == "join" ){
                if(!parsedMessage.payload.room){
                    return socket.send("room can't be empty")}
                allSockets.push({
                    socket,
                    room: parsedMessage.payload.room,
                    ip: parsedMessage.ip

                })
            }
            if(parsedMessage.type == "chat"){
                if(!parsedMessage.payload.message){
                    return socket.send("message can't be empty")}
                const currentRoom = allSockets.find(x=>x.socket == socket)?.room;
                if(!currentRoom)return;
                allSockets.forEach(user=>{
                    if(user.room == currentRoom){
                        user.socket.send(JSON.stringify(parsedMessage))
                    }
                });
            }
            if(!parsedMessage.type){
                 return socket.send("type not mentioned")
            }
        }catch(e){
            console.log("this is the error : " + e);
            socket.send("error " + e)

    }
    })

})


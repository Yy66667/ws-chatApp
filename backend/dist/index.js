"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 2390 });
let userCount = 0;
let allSockets = [];
wss.addListener("connection", (socket) => {
    socket.on("message", (ev) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const parsedMessage = JSON.parse(ev.toString());
        try {
            if (parsedMessage.type == "join") {
                if (!parsedMessage.payload.room) {
                    return socket.send("room can't be empty");
                }
                allSockets.push({
                    socket,
                    room: parsedMessage.payload.room,
                    ip: parsedMessage.ip
                });
            }
            if (parsedMessage.type == "chat") {
                if (!parsedMessage.payload.message) {
                    return socket.send("message can't be empty");
                }
                const currentRoom = (_a = allSockets.find(x => x.socket == socket)) === null || _a === void 0 ? void 0 : _a.room;
                if (!currentRoom)
                    return;
                allSockets.forEach(user => {
                    if (user.room == currentRoom) {
                        user.socket.send(JSON.stringify(parsedMessage));
                    }
                });
            }
            if (!parsedMessage.type) {
                return socket.send("type not mentioned");
            }
        }
        catch (e) {
            console.log("this is the error : " + e);
            socket.send("error " + e);
        }
    }));
});

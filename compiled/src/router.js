"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
class Router {
    constructor(db, roomController) {
        this.db = db;
        this.roomCtrl = roomController;
    }
    addSocket(socket) {
        this.db.addSocket(socket);
        socket.connection.send(JSON.stringify({ type: "socketID", payload: socket.socketID }));
        socket.connection.on('close', (reasonCode, description) => {
            this.roomCtrl.disconnectSocketFromRoom(socket);
            // Remove socket from room handler on socket disconnect
            this.db.deleteSocket(socket);
        });
        socket.connection.on('message', (msg) => {
            if (msg.type == 'binary') {
                const event = JSON.parse(msg.binaryData);
                event.payload = Object.assign({ socketID: socket.socketID }, event.payload);
                if (event.context == "menu") {
                    if (event.type == "create_game") {
                        this.roomCtrl.createRoom(event.payload.roomID, socket);
                    }
                    if (event.type == "join_game") {
                        this.roomCtrl.joinRoom(event.payload.roomID, socket);
                    }
                }
                else if (event.context == "game") {
                    this.roomCtrl.addGameEvent(socket, event.type, event.payload);
                }
                else if (event.context == "room") {
                    if (event.type == "exit_game") {
                        this.roomCtrl.disconnectSocketFromRoom(socket);
                    }
                    else if (event.type == "vote_new_game") {
                        this.roomCtrl.voteNewGame(socket);
                    }
                }
            }
        });
    }
}
exports.Router = Router;

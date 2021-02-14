"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = exports.Room = exports.GameEvent = exports.Socket = void 0;
class Socket {
    constructor(connection) {
        this.connection = connection;
        this.socketID = Socket.nextSocketID++;
    }
}
exports.Socket = Socket;
Socket.nextSocketID = 0;
class GameEvent {
    constructor(eventID, type, payload = {}) {
        this.event_id = eventID;
        this.event_type = type;
        this.payload = payload;
    }
}
exports.GameEvent = GameEvent;
class Room {
    constructor(id) {
        this.events = [];
        this.newGameVotes = new Set();
        this.id = id;
    }
}
exports.Room = Room;
class Database {
    constructor() {
        this.sockets = [];
        this.rooms = [];
        this.lastGameEventID = 0;
    }
    getRoomSockets(roomID) {
        return this.sockets.filter(s => s.roomID == roomID);
    }
    disconnectSocketFromRoom(socket) {
        const roomID = socket.roomID;
        if (!roomID) {
            console.log("Warning: Socket trying to exit room when it is not in a room");
            return;
        }
        socket.roomID = undefined;
        this.deleteRoom(roomID);
    }
    getRoom(roomID) {
        const room = this.rooms.find(r => r.id == roomID);
        if (!room)
            throw new Error("Could not find room with ID: " + roomID);
        return room;
    }
    roomExists(roomID) {
        return this.rooms.findIndex(r => r.id == roomID) > -1;
    }
    createRoom(roomID) {
        this.rooms.push(new Room(roomID));
    }
    deleteRoom(roomID) {
        this.rooms = this.rooms.filter(r => r.id != roomID);
    }
    addSocket(socket) {
        this.sockets.push(socket);
    }
    deleteSocket(socket) {
        this.sockets = this.sockets.filter(s => s != socket);
    }
    addGameEvent(roomID, eventType, payload = {}) {
        const event = new GameEvent(this.lastGameEventID++, eventType, payload);
        this.getRoom(roomID).events.push(event);
    }
    resetRoom(roomID) {
        const room = this.getRoom(roomID);
        room.events = [];
        room.newGameVotes = new Set();
    }
}
exports.Database = Database;

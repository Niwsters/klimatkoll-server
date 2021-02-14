"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = require("websocket");
const http_1 = __importDefault(require("http"));
const database_1 = require("./src/database");
const router_1 = require("./src/router");
const room_1 = require("./src/room");
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const isHeroku = process.env._ && process.env._.indexOf("heroku") > -1;
// Create a server to server klimatkoll.html
const app = express_1.default();
app.use(express_1.default.static('public'));
const publicPath = isHeroku ? '../public' : 'public';
app.get('/', (req, res) => {
    res.sendFile('klimatkoll.html', { root: path_1.default.join(__dirname, publicPath) });
});
const server = http_1.default.createServer(app);
const port = 4200; //isHeroku ? 80 : 4200
server.listen(port, function () {
    console.log((new Date()) + ` Server is listening on port ${port}`);
});
// Set up a separate web socket server with a different port
const clientListener = http_1.default.createServer((req, res) => {
    console.log((new Date()) + ' Received request for ' + req.url);
    res.writeHead(404);
    res.end();
});
clientListener.listen(8080);
const wsServer = new websocket_1.server({
    httpServer: clientListener,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});
function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}
const db = new database_1.Database();
const roomCtrl = new room_1.RoomController(db);
const router = new router_1.Router(db, roomCtrl);
wsServer.on('request', function (request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }
    const connection = request.accept('echo-protocol', request.origin);
    const socket = new database_1.Socket(connection);
    router.addSocket(socket);
    connection.on('close', function (reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

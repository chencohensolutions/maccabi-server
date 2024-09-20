import { Express } from 'express';
import WebSocket from 'ws';
import http from 'http';
import { v6 as uuidv6 } from 'uuid';

interface IRoomUser {
    userId: string;
    userName: string;
    socket: WebSocket;
}

interface IRoomMessageReadTimestamp {
    [userId: string]: string;
}

interface IRoomMessage {
    userId: string;
    message: string;
    timestamp: string;
    readTimestamp: IRoomMessageReadTimestamp;
}

interface IRooms {
    [id: string]: {
        users: IRoomUser[],
        messages: IRoomMessage[],
        title: string | undefined
    };
}

enum EChatRoomsRequest {
    GETROOMS = 'get_rooms',
    CREATEROOM = 'create_room',
    JOINROOM = 'join_room',
    SENDMESSAGE = 'send_message',
}

enum EChatRoomsEvents {
    ROOMSLISTUPDATE = 'rooms_list_update',
    USERSLISTUPDATE = 'users_list_update',
};


class ChatRoomsServer {
    server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse> | null;
    webSocket: WebSocket.Server<typeof WebSocket, typeof http.IncomingMessage> | null;
    rooms: IRooms;
    sockets: WebSocket[] = [];
    constructor() {
        console.log('ChatRooms constructor');
        this.server = null;
        this.webSocket = null;
        this.rooms = {};
    }
    init() {
        // this.server = http.createServer(app);
        this.webSocket = new WebSocket.Server({ port: 3002 });

        this.webSocket.on('connection', (socket) => {
            // const connection = socket.accept(undefined, request.origin);
            this.sockets.push(socket);


            const sendRoomsListUpdate = () => {
                socket.send(JSON.stringify({
                    event: EChatRoomsEvents.ROOMSLISTUPDATE,
                    rooms: Object.keys(this.rooms).map((id) => ({
                        id,
                        title: this.rooms[id].title,
                    }))
                }));
            };

            const broadcastRoomsListUpdate = () => {
                const rooms = Object.keys(this.rooms).map((id) => ({
                    title: this.rooms[id].title,
                    id
                }));
                this.sockets.forEach((socket) => {
                    socket.send(JSON.stringify({
                        event: EChatRoomsEvents.ROOMSLISTUPDATE,
                        rooms
                    }));
                });
            };

            const broadcastUsersListUpdate = (roomId: string) => {
                this.rooms[roomId].users.forEach((user) => {
                    user.socket.send(JSON.stringify({
                        event: EChatRoomsEvents.USERSLISTUPDATE,
                        users: this.rooms[roomId].users
                    }));
                });
                socket.send(JSON.stringify({
                    event: EChatRoomsEvents.USERSLISTUPDATE,
                    users: this.rooms[roomId].users
                }));
            };

            socket.on('message', (data: string) => {
                const message = data.toString();
                if (typeof message !== 'string') return;
                const messageObj: { request: EChatRoomsRequest, title?: string, roomId?: string, userId?: string, userName?: string } = JSON.parse(message);
                switch (messageObj.request) {
                    case EChatRoomsRequest.GETROOMS:
                        sendRoomsListUpdate()
                        break;
                    case EChatRoomsRequest.CREATEROOM:
                        let roomId = uuidv6();
                        this.rooms[roomId] = { users: [], messages: [], title: messageObj.title };
                        broadcastRoomsListUpdate()
                        break;
                    case EChatRoomsRequest.JOINROOM:
                        if (!messageObj.roomId || !messageObj.userId || !messageObj.userName) return;
                        if (!this.rooms[messageObj.roomId]) return;
                        this.rooms[messageObj.roomId].users.push({
                            userId: messageObj.userId,
                            userName: messageObj.userName,
                            socket
                        });
                        broadcastUsersListUpdate(messageObj.roomId);
                        break;
                    case EChatRoomsRequest.SENDMESSAGE:
                        // const msg: { text: string, readBy: string[] } = { text: data.text!, readBy: [] };
                        // rooms[currentRoom].messages.push(msg);
                        // rooms[currentRoom].clients.forEach((client: WebSocket) => client.send(JSON.stringify({ type: 'new_message', message: msg })));
                        break;
                }
            });
            socket.on('close', () => {
                this.sockets = this.sockets.filter((s) => s !== socket);
            });

        });
    }
    getRooms() { };
}

export const chatRoomsServer = new ChatRoomsServer();

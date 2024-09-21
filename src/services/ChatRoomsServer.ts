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
    messageId: string;
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
    LEAVEROOM = 'leave_room',
    SENDMESSAGE = 'send_message',
    MARKASREAD = 'mark_as_read',
}

enum EChatRoomsEvents {
    ROOMSLISTUPDATE = 'rooms_list_update',
    USERSLISTUPDATE = 'users_list_update',
    ROOMHISTORY = 'room_history',
    MESSAGESUPDATE = 'messages_update',
    NEWMESSAGE = 'new_message',
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
                    rooms: Object.keys(this.rooms).map((roomId) => ({
                        id: roomId,
                        title: this.rooms[roomId].title,
                    }))
                }));
            };

            const sendRoomHistory = (roomId: string) => {
                const event = {
                    event: EChatRoomsEvents.ROOMHISTORY,
                    roomId: roomId,
                    messages: this.rooms[roomId].messages
                };
                socket.send(JSON.stringify(event));
            };

            const broadcastRoomsListUpdate = () => {
                const rooms = Object.keys(this.rooms).map((roomId) => ({
                    title: this.rooms[roomId].title,
                    id: roomId
                }));
                this.sockets.forEach((socket) => {
                    const event = {
                        event: EChatRoomsEvents.ROOMSLISTUPDATE,
                        rooms
                    };
                    socket.send(JSON.stringify(event));
                });
            };

            const broadcastUsersListUpdate = (roomId: string) => {
                if (!this.rooms[roomId]) return;
                this.rooms[roomId].users.forEach((user) => {
                    user.socket.send(JSON.stringify({
                        event: EChatRoomsEvents.USERSLISTUPDATE,
                        id: roomId,
                        title: this.rooms[roomId].title,
                        users: this.rooms[roomId].users
                    }));
                });
            };

            const broadcastMessagesUpdate = (roomId: string, messages: IRoomMessage[]) => {
                this.rooms[roomId].users.forEach((user) => {
                    const event = {
                        event: EChatRoomsEvents.MESSAGESUPDATE,
                        messages: messages
                    }
                    user.socket.send(JSON.stringify(event));
                });
            };

            const broadcastNewMessage = (roomId: string, message: IRoomMessage) => {
                this.rooms[roomId].users.forEach((user) => {
                    const event = {
                        event: EChatRoomsEvents.NEWMESSAGE,
                        message
                    }
                    user.socket.send(JSON.stringify(event));
                });
            }

            socket.on('message', (data: string) => {
                const message = data.toString();
                if (typeof message !== 'string') return;
                const messageObj: {
                    request: EChatRoomsRequest,
                    title?: string,
                    roomId?: string,
                    userId?: string,
                    userName?: string,
                    message?: string,
                    messageId?: string,
                    messagesId?: string[],
                } = JSON.parse(message);

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
                        let findUser = this.rooms[messageObj.roomId].users.find((user) => user.userId === messageObj.userId);
                        if (findUser) {
                            findUser.socket = socket;
                        } else {
                            this.rooms[messageObj.roomId].users.push({
                                userId: messageObj.userId,
                                userName: messageObj.userName,
                                socket
                            });
                        }
                        socket.on('close', () => {
                            if (!messageObj.roomId) return;
                            this.rooms[messageObj.roomId].users = this.rooms[messageObj.roomId].users.filter((user) => user.userId !== messageObj.userId);
                            broadcastUsersListUpdate(messageObj.roomId);
                        });

                        sendRoomHistory(messageObj.roomId);
                        broadcastUsersListUpdate(messageObj.roomId);

                        // broadcastMessagesUpdate(messageObj.roomId, this.rooms[messageObj.roomId].messages);

                        break;
                    case EChatRoomsRequest.LEAVEROOM:
                        if (!messageObj.roomId || !messageObj.userId) return;
                        if (!this.rooms[messageObj.roomId]) return;
                        this.rooms[messageObj.roomId].users = this.rooms[messageObj.roomId].users.filter((user) => user.userId !== messageObj.userId);
                        broadcastUsersListUpdate(messageObj.roomId);
                        break;
                    case EChatRoomsRequest.SENDMESSAGE:
                        if (!messageObj.roomId || !messageObj.userId) return;
                        if (!this.rooms[messageObj.roomId]) return;
                        const newMessage = {
                            messageId: messageObj.messageId || uuidv6(),
                            userId: messageObj.userId,
                            message: messageObj.message || '',
                            timestamp: new Date().toISOString(),
                            readTimestamp: {
                                [messageObj.userId]: new Date().toISOString()
                            }
                        }
                        this.rooms[messageObj.roomId].messages.push(newMessage);
                        broadcastNewMessage(messageObj.roomId, newMessage);
                        break;
                    case EChatRoomsRequest.MARKASREAD:
                        if (!messageObj.roomId || !messageObj.userId || !messageObj.messagesId) return;
                        if (!this.rooms[messageObj.roomId]) return;
                        if (!messageObj.messagesId) return;
                        let messagesUpdate = [] as IRoomMessage[];
                        messageObj.messagesId.forEach((messageId) => {
                            if (!messageObj.roomId || !messageObj.userId) return;
                            const findMessage = this.rooms[messageObj.roomId].messages.find((message) => message.messageId === messageId);
                            if (!findMessage) return;
                            if (findMessage.readTimestamp[messageObj.userId]) return;
                            findMessage.readTimestamp[messageObj.userId] = new Date().toISOString();
                            messagesUpdate.push(findMessage);
                        });
                        broadcastMessagesUpdate(messageObj.roomId, messagesUpdate);
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

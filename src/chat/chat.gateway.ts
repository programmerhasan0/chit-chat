import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { SubscribeMessage } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
    data: {
        user: {
            id: number;
            email: string;
            name?: string;
        };
    };
}

@WebSocketGateway(3002, { cors: '*' })
export class ChatGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer()
    server: Server;

    private onlineUsers: Map<number, string> = new Map();

    constructor(
        private readonly chatService: ChatService,
        private readonly jwtService: JwtService,
    ) {}

    // checking is the user logged in or not after connection init
    afterInit(server: Server) {
        server.use((client: AuthenticatedSocket, next) => {
            const auth = client.handshake.headers.authorization;

            if (!auth) return next(new Error('unauthorized'));
            if (auth.startsWith('Bearer')) {
                const token = auth.split(' ')[1];

                try {
                    const decodedToken = this.jwtService.verify<{
                        id: number;
                        email: string;
                        iat: number;
                        eat: number;
                    }>(token, {
                        secret: process.env.JWT_SECRET,
                    });

                    if (decodedToken.id) {
                        client.data.user = decodedToken;
                        return next();
                    }
                } catch (err) {
                    if (err instanceof TokenExpiredError) {
                        return next(new Error('Token expired'));
                    } else {
                        return next(new Error('Invalid token'));
                    }
                }
            }
        });
    }

    // hit on connection established
    async handleConnection(client: AuthenticatedSocket) {
        const user = client.data.user;

        if (!user) {
            client.emit('reply', 'unauthorized');
            client.disconnect();
        }

        // adding users to online list
        this.onlineUsers.set(user.id, client.id);
        const messages = await this.chatService.getMessages(user.id);
        client.emit('previousMessages', messages);
    }

    // hit upon disconnect
    async handleDisconnect(client: AuthenticatedSocket) {
        for (const [userId, socketId] of this.onlineUsers.entries()) {
            if (socketId === client.id) {
                this.onlineUsers.delete(userId);
                break;
            }
        }
    }

    @SubscribeMessage('newMessage')
    async handleNewMessage(
        client: AuthenticatedSocket,
        message: { receiverId: number; content: string },
    ) {
        const user = client.data.user;
        const senderId = user.id;

        //save the message and emit to both sender and reeiver

        const savedMessage = await this.chatService.sendMessage(
            senderId,
            message.receiverId,
            message.content,
        );

        if (savedMessage.id) {
            // emit to sender
            client.emit('message', message.content);

            // emit to the receiver if online
            const receiverSocketId = this.onlineUsers.get(message.receiverId);
            if (receiverSocketId) {
                this.server.to(receiverSocketId).emit('reply', message.content);
            }
        }
    }
}

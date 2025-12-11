import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) {}

    async getMessages(userId: number) {
        const messages = await this.prisma.message.findMany({
            where: {
                OR: [{ senderId: userId }, { receiverId: userId }],
            },
        });

        return messages;
    }

    async sendMessage(senderId: number, receiverId: number, content: string) {
        const message = await this.prisma.message.create({
            data: {
                senderId,
                receiverId,
                content,
            },
        });
        return message;
    }
}

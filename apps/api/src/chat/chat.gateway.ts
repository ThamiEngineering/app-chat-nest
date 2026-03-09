import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

import { PrismaService } from 'src/prisma.service';
import { MessagesService } from 'src/messages/messages.service';

type JwtPayload = { sub: string; email: string };

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly messagesService: MessagesService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    const token =
      (client.handshake.auth?.token as string | undefined) ||
      (client.handshake.query?.token as string | undefined);

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      client.data.user = payload;
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(_client: Socket) {}

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, roomId: string) {
    void client.join(roomId);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, roomId: string) {
    void client.leave(roomId);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    client: Socket,
    payload: { roomId: string; content: string },
  ) {
    const user = client.data.user as JwtPayload;
    const message = await this.messagesService.create(
      payload.roomId,
      user.sub,
      payload.content,
    );
    this.server.to(payload.roomId).emit('newMessage', message);
  }

  @SubscribeMessage('typing')
  handleTyping(client: Socket, payload: { roomId: string; username?: string }) {
    const user = client.data.user as JwtPayload;
    client.to(payload.roomId).emit('userTyping', {
      userId: user.sub,
      username: payload.username ?? user.email,
    });
  }

  @SubscribeMessage('addReaction')
  async handleAddReaction(
    client: Socket,
    payload: { messageId: string; emoji: string; roomId: string },
  ) {
    const user = client.data.user as JwtPayload;
    await this.prisma.reaction.upsert({
      where: {
        messageId_userId_emoji: {
          messageId: payload.messageId,
          userId: user.sub,
          emoji: payload.emoji,
        },
      },
      update: {},
      create: {
        messageId: payload.messageId,
        userId: user.sub,
        emoji: payload.emoji,
      },
    });

    const reactions = await this.prisma.reaction.findMany({
      where: { messageId: payload.messageId },
      include: { user: { select: { id: true, username: true } } },
    });

    this.server
      .to(payload.roomId)
      .emit('reactionUpdated', { messageId: payload.messageId, reactions });
  }

  @SubscribeMessage('removeReaction')
  async handleRemoveReaction(
    client: Socket,
    payload: { messageId: string; emoji: string; roomId: string },
  ) {
    const user = client.data.user as JwtPayload;
    await this.prisma.reaction.deleteMany({
      where: {
        messageId: payload.messageId,
        userId: user.sub,
        emoji: payload.emoji,
      },
    });

    const reactions = await this.prisma.reaction.findMany({
      where: { messageId: payload.messageId },
      include: { user: { select: { id: true, username: true } } },
    });

    this.server
      .to(payload.roomId)
      .emit('reactionUpdated', { messageId: payload.messageId, reactions });
  }
}

import { ForbiddenException, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma.service';

const authorSelect = { id: true, username: true, color_custom: true };
const reactionInclude = { user: { select: { id: true, username: true } } };

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async getHistory(roomId: string, userId: string) {
    const member = await this.prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });

    if (!member) throw new ForbiddenException();

    return this.prisma.message.findMany({
      where: {
        roomId,
        ...(!member.hasHistoryAccess && { createdAt: { gte: member.joinedAt } }),
      },
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: authorSelect },
        reactions: { include: reactionInclude },
      },
    });
  }

  create(roomId: string, authorId: string, content: string) {
    return this.prisma.message.create({
      data: { roomId, authorId, content },
      include: {
        author: { select: authorSelect },
        reactions: { include: reactionInclude },
      },
    });
  }
}

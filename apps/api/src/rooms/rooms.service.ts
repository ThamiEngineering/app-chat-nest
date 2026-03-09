import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { InviteMemberDto } from './dto/invite-member.dto';

const memberSelect = {
  id: true,
  username: true,
  color_custom: true,
  email: true,
};

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateRoomDto) {
    return this.prisma.room.create({
      data: {
        name: dto.name,
        members: {
          create: { userId, hasHistoryAccess: true },
        },
      },
      include: {
        members: { include: { user: { select: memberSelect } } },
      },
    });
  }

  findAllForUser(userId: string) {
    return this.prisma.room.findMany({
      where: { members: { some: { userId } } },
      include: {
        members: { include: { user: { select: memberSelect } } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.room.findUnique({
      where: { id },
      include: {
        members: { include: { user: { select: memberSelect } } },
      },
    });
  }

  addMember(roomId: string, dto: InviteMemberDto) {
    return this.prisma.roomMember.create({
      data: {
        roomId,
        userId: dto.userId,
        hasHistoryAccess: dto.hasHistoryAccess ?? false,
      },
      include: { user: { select: memberSelect } },
    });
  }

  removeMember(roomId: string, userId: string) {
    return this.prisma.roomMember.delete({
      where: { roomId_userId: { roomId, userId } },
    });
  }
}

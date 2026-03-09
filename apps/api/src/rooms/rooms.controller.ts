import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import type { RequestWithUser } from 'src/auth/auth.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateRoomDto } from './dto/create-room.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { RoomsService } from './rooms.service';

@Controller('rooms')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateRoomDto) {
    return this.roomsService.create(req.user.sub, dto);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.roomsService.findAllForUser(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Post(':id/members')
  addMember(@Param('id') roomId: string, @Body() dto: InviteMemberDto) {
    return this.roomsService.addMember(roomId, dto);
  }

  @Delete(':id/members/:userId')
  removeMember(@Param('id') roomId: string, @Param('userId') userId: string) {
    return this.roomsService.removeMember(roomId, userId);
  }
}

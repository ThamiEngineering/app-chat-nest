import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import type { RequestWithUser } from 'src/auth/auth.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { MessagesService } from './messages.service';

@Controller('rooms/:roomId/messages')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  getHistory(@Param('roomId') roomId: string, @Req() req: RequestWithUser) {
    return this.messagesService.getHistory(roomId, req.user.sub);
  }
}

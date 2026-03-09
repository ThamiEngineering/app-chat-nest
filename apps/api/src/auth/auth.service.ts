import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from 'src/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, email: user.email };
    return { access_token: await this.jwtService.signAsync(payload) };
  }

  async register(
    email: string,
    password: string,
    username?: string,
  ): Promise<any> {
    const user = await this.usersService.create({
      email,
      password: await bcrypt.hash(password, 10),
      ...(username && { username }),
    });

    // Auto-add to the general room
    const generalRoom = await this.prisma.room.findFirst({
      where: { isGeneral: true },
    });
    if (generalRoom) {
      await this.prisma.roomMember.create({
        data: { roomId: generalRoom.id, userId: user.id, hasHistoryAccess: true },
      });
    }

    const payload = { sub: user.id, email: user.email };
    return { access_token: await this.jwtService.signAsync(payload) };
  }
}

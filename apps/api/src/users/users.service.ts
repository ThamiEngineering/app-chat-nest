import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      omit: { password: true },
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      omit: { password: true },
    });
  }

  findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      omit: { password: true },
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}

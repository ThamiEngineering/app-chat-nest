import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import 'dotenv/config';

import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { MessagesModule } from './messages/messages.module';
import { PrismaModule } from './prisma.module';
import { RoomsModule } from './rooms/rooms.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    RoomsModule,
    MessagesModule,
    ChatModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}

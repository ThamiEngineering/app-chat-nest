import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MinLength } from 'class-validator';

export class ReactionDto {
  @ApiProperty({ example: 'uuid-du-message' })
  @IsUUID()
  messageId: string;

  @ApiProperty({ example: '👍' })
  @IsString()
  @MinLength(1)
  emoji: string;

  @ApiProperty({ example: 'uuid-du-salon' })
  @IsUUID()
  roomId: string;
}

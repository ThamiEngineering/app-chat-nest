import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class TypingDto {
  @ApiPropertyOptional({ example: 'uuid-du-salon' })
  @IsUUID()
  roomId: string;

  @ApiPropertyOptional({ example: 'Alice' })
  @IsOptional()
  @IsString()
  username?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: 'uuid-du-salon' })
  @IsUUID()
  roomId: string;

  @ApiProperty({ example: 'Bonjour !' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;
}

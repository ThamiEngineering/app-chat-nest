import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ example: 'Mon salon' })
  @IsString()
  @MinLength(1)
  name: string;
}

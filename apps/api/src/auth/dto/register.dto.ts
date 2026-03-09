import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'test@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password1!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ example: 'john_doe' })
  @IsOptional()
  @IsString()
  username?: string;
}

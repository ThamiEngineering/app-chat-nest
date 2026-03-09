import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class InviteMemberDto {
  @ApiProperty({ example: 'uuid-de-l-utilisateur' })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasHistoryAccess?: boolean;
}

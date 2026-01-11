import { IsString, IsOptional } from 'class-validator';

export class UploadAvatarDto {
  @IsString()
  @IsOptional()
  avatar?: string;
}

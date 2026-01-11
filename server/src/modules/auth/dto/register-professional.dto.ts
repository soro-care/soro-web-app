import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  IsNumber,
} from 'class-validator';

export class RegisterProfessionalDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain uppercase, lowercase, number, and special character',
  })
  password: string;

  @IsBoolean()
  @IsOptional()
  isPeerCounselor?: boolean;

  @IsString()
  @IsOptional()
  specialization?: string;

  @IsArray()
  @IsOptional()
  qualifications?: string[];

  @IsString()
  @IsOptional()
  bio?: string;

  @IsNumber()
  @IsOptional()
  yearsOfExperience?: number;
}

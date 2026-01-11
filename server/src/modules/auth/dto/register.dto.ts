// src/modules/auth/dto/register.dto.ts

import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
//   IsOptional,
//   IsBoolean,
//   IsArray,
//   IsNumber,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  @Matches(
    /^[0-9]{1,2}-[0-9]{1,2}[a-z]{2}[0-9]+@students\.unilorin\.edu\.ng$/i,
    {
      message:
        'Only accessible to students of University of Ilorin – please enter your student email.',
    },
  )
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain uppercase, lowercase, number, and special character',
  })
  password: string;
}

// // src/modules/auth/dto/verify-otp.dto.ts

// export class VerifyOtpDto {
//   @IsEmail()
//   email: string;

//   @IsString()
//   @MinLength(4)
//   @MaxLength(4)
//   otp: string;
// }

// // src/modules/auth/dto/resend-otp.dto.ts

// export class ResendOtpDto {
//   @IsEmail()
//   email: string;
// }

// // src/modules/auth/dto/login.dto.ts

// export class LoginDto {
//   @IsEmail()
//   email: string;

//   @IsString()
//   @IsNotEmpty()
//   password: string;
// }

// // src/modules/auth/dto/forgot-password.dto.ts

// export class ForgotPasswordDto {
//   @IsEmail()
//   email: string;
// }

// // src/modules/auth/dto/verify-reset-otp.dto.ts

// export class VerifyResetOtpDto {
//   @IsEmail()
//   email: string;

//   @IsString()
//   @MinLength(6)
//   @MaxLength(6)
//   otp: string;
// }

// // src/modules/auth/dto/reset-password.dto.ts

// export class ResetPasswordDto {
//   @IsString()
//   @IsNotEmpty()
//   tempToken: string;

//   @IsString()
//   @MinLength(8)
//   @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
//     message:
//       'Password must contain uppercase, lowercase, number, and special character',
//   })
//   newPassword: string;

//   @IsString()
//   @IsNotEmpty()
//   confirmPassword: string;
// }

// // src/modules/auth/dto/change-password.dto.ts

// export class ChangePasswordDto {
//   @IsString()
//   @IsNotEmpty()
//   currentPassword: string;

//   @IsString()
//   @MinLength(8)
//   @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
//     message:
//       'Password must contain uppercase, lowercase, number, and special character',
//   })
//   newPassword: string;
// }

// // src/modules/auth/dto/register-professional.dto.ts

// export class RegisterProfessionalDto {
//   @IsString()
//   @IsNotEmpty()
//   @MinLength(2)
//   @MaxLength(100)
//   name: string;

//   @IsEmail()
//   email: string;

//   @IsString()
//   @MinLength(8)
//   @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
//     message:
//       'Password must contain uppercase, lowercase, number, and special character',
//   })
//   password: string;

//   @IsBoolean()
//   @IsOptional()
//   isPeerCounselor?: boolean;

//   @IsString()
//   @IsOptional()
//   specialization?: string;

//   @IsArray()
//   @IsOptional()
//   qualifications?: string[];

//   @IsString()
//   @IsOptional()
//   bio?: string;

//   @IsNumber()
//   @IsOptional()
//   yearsOfExperience?: number;
// }
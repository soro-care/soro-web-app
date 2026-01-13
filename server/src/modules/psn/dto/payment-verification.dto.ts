// src/modules/psn/dto/payment-verification.dto.ts

import { IsString, IsNotEmpty } from 'class-validator';

export class PaymentVerificationDto {
  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsString()
  @IsNotEmpty()
  applicationId: string;
}

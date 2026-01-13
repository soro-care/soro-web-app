// src/modules/survey/dto/create-survey.dto.ts

import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  MaxLength,
  ArrayMaxSize,
  ArrayMinSize,
} from 'class-validator';

export class CreateSurveyDto {
  @IsEnum(['Under 18', '18–21', '22–25', '26+'], {
    message: 'Invalid age range',
  })
  ageRange: string;

  @IsEnum(['Female', 'Male', 'Prefer not to say'], {
    message: 'Invalid gender',
  })
  gender: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1, { message: 'Please select at least 1 concern' })
  @ArrayMaxSize(2, { message: 'Please select no more than 2 concerns' })
  concerns: string[];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  otherConcern?: string;

  @IsEnum(['Yes', 'No', 'Unsure'], {
    message: 'Invalid diagnosis status',
  })
  diagnosed: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  diagnosisDetails?: string;
}

// src/modules/survey/dto/update-survey.dto.ts

import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  MaxLength,
  ArrayMaxSize,
  ArrayMinSize,
} from 'class-validator';

export class UpdateSurveyDto {
  @IsOptional()
  @IsEnum(['Under 18', '18–21', '22–25', '26+'])
  ageRange?: string;

  @IsOptional()
  @IsEnum(['Female', 'Male', 'Prefer not to say'])
  gender?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  concerns?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  otherConcern?: string;

  @IsOptional()
  @IsEnum(['Yes', 'No', 'Unsure'])
  diagnosed?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  diagnosisDetails?: string;
}

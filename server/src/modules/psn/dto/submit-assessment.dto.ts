// src/modules/psn/dto/submit-assessment.dto.ts

import {
  IsArray,
  ValidateNested,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class MCQAnswer {
  questionId: string;
  selectedOption: string;
}

class EssayAnswer {
  questionId: string;
  answer: string;
}

export class SubmitAssessmentDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MCQAnswer)
  mcqAnswers?: MCQAnswer[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EssayAnswer)
  essayAnswers?: EssayAnswer[];

  @IsBoolean()
  isPreAssessment: boolean;
}

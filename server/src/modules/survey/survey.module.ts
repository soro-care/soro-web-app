// src/modules/survey/survey.module.ts

import { Module, Global } from '@nestjs/common';
import { SurveyController } from './survey.controller';
import { SurveyService } from './survey.service';

@Global()
@Module({
  controllers: [SurveyController],
  providers: [SurveyService],
  exports: [SurveyService],
})
export class SurveyModule {}

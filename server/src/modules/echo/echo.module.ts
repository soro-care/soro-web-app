// src/modules/echo/echo.module.ts

import { Module, Global } from '@nestjs/common';
import { EchoController } from './echo.controller';
import { EchoService } from './echo.service';
import { CrisisDetectionService } from './services/crisis-detection.service';

@Global()
@Module({
  controllers: [EchoController],
  providers: [EchoService, CrisisDetectionService],
  exports: [EchoService, CrisisDetectionService],
})
export class EchoModule {}

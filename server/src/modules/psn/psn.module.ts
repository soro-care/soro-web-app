// src/modules/psn/psn.module.ts

import { Module, Global } from '@nestjs/common';
import { PSNController } from './psn.controller';
import { PSNService } from './psn.service';

@Global()
@Module({
  controllers: [PSNController],
  providers: [PSNService],
  exports: [PSNService],
})
export class PSNModule {}

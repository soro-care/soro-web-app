// src/modules/blog/blog.module.ts

import { Module, Global } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';

@Global()
@Module({
  controllers: [BlogController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule {}

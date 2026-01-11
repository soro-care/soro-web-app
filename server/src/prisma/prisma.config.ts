import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: './schema.prisma',       // relative to this file
  migrations: {
    path: './migrations',          // relative to this file
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});

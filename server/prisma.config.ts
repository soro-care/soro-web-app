import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'), // this is all you need
  },
  migrations: {
    path: './prisma/migrations', // optional if using migrate
  },
});

import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  // Generate/build without credentials; database commands require explicit configuration.
  datasource: { url: process.env.DIRECT_DATABASE_URL ?? '' },
});

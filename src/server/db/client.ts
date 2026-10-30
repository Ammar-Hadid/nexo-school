import 'server-only';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';
import { databaseConnectionString } from './connection-string';

const globalDb = globalThis as typeof globalThis & { nexoDb?: PrismaClient };

/** Lazy: static pages, Storybook and builds do not require or connect to a database. */
export function getDatabase(): PrismaClient {
  if (!globalDb.nexoDb) {
    const adapter = new PrismaPg({
      connectionString: databaseConnectionString(process.env.DATABASE_URL),
      max: 3,
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 30_000,
    });
    globalDb.nexoDb = new PrismaClient({ adapter });
  }
  return globalDb.nexoDb;
}

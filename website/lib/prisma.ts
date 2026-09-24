import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { pooledDatabaseUrl } from "@/prisma/db-url";

function createClient() {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: pooledDatabaseUrl() }),
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Reuse the client across hot reloads in dev so we don't exhaust connections.
export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

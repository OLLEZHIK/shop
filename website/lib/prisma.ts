import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

function createClient() {
  return new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL,
  }).$extends(withAccelerate());
}

type AcceleratedClient = ReturnType<typeof createClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: AcceleratedClient | undefined;
};

// Reuse the client across hot reloads in dev so we don't exhaust connections.
export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

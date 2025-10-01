import { PrismaClient } from '../generated/prisma';
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma ||
    new PrismaClient({
        log: ['error', 'warn'],
    });
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
export async function gracefullyShutdownPrisma() {
    await prisma.$disconnect();
}
//# sourceMappingURL=prisma.js.map
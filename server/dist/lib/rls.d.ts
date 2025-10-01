import { PrismaClient } from '../generated/prisma';
/**
 * Sets the current user address in the database session for RLS policies
 * This must be called before any query that should respect RLS policies
 */
export declare function setRLSContext(prisma: PrismaClient, userAddress: string): Promise<void>;
/**
 * Executes a database operation with RLS context set for a specific user
 * This is a convenience function that sets the context and executes the callback
 */
export declare function withRLSContext<T>(prisma: PrismaClient, userAddress: string, callback: () => Promise<T>): Promise<T>;
/**
 * Creates a Prisma client with RLS context pre-set
 * Useful for creating a scoped client for a specific user
 */
export declare function createRLSClient(prisma: PrismaClient, userAddress: string): Promise<PrismaClient>;
/**
 * Middleware to extract user address from request headers
 * Expected header: x-user-address or authorization (wallet address)
 */
export declare function extractUserAddress(req: any): string | null;
//# sourceMappingURL=rls.d.ts.map
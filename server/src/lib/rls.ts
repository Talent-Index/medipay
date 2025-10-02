import { PrismaClient } from '../../prisma/generated/prisma';

/**
 * Sets the current user address in the database session for RLS policies
 * This must be called before any query that should respect RLS policies
 */
export async function setRLSContext(prisma: PrismaClient, userAddress: string): Promise<void> {
  if (!userAddress) {
    throw new Error('User address is required for RLS context');
  }

  // Set the session variable that RLS policies use
  await prisma.$executeRawUnsafe(
    `SELECT set_current_user_address($1)`,
    userAddress
  );
}

/**
 * Executes a database operation with RLS context set for a specific user
 * This is a convenience function that sets the context and executes the callback
 */
export async function withRLSContext<T>(
  prisma: PrismaClient,
  userAddress: string,
  callback: () => Promise<T>
): Promise<T> {
  await setRLSContext(prisma, userAddress);
  return callback();
}

/**
 * Creates a Prisma client with RLS context pre-set
 * Useful for creating a scoped client for a specific user
 */
export async function createRLSClient(
  prisma: PrismaClient,
  userAddress: string
): Promise<PrismaClient> {
  await setRLSContext(prisma, userAddress);
  return prisma;
}

/**
 * Middleware to extract user address from request headers
 * Expected header: x-user-address or authorization (wallet address)
 */
export function extractUserAddress(req: any): string | null {
  // Try x-user-address header first
  const userAddress = req.headers['x-user-address'];
  if (userAddress) {
    return userAddress as string;
  }

  // Try authorization header (for wallet-based auth)
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    // Remove 'Bearer ' prefix if present
    const address = authHeader.replace(/^Bearer\s+/i, '');
    return address;
  }

  return null;
}

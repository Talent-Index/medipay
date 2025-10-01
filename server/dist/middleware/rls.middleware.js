import { prisma } from '../lib/prisma';
import { setRLSContext, extractUserAddress } from '../lib/rls';
/**
 * Middleware to automatically set RLS context from request headers
 * This should be added to routes that require RLS protection
 */
export async function rlsMiddleware(req, res, next) {
    try {
        const userAddress = extractUserAddress(req);
        if (!userAddress) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'User address is required. Please provide x-user-address header or authorization header.'
            });
            return;
        }
        // Set RLS context for this request
        await setRLSContext(prisma, userAddress);
        // Attach user address to request for use in route handlers
        req.userAddress = userAddress;
        next();
    }
    catch (error) {
        console.error('RLS middleware error:', error);
        res.status(500).json({ error: 'Failed to set security context' });
    }
}
/**
 * Optional middleware - sets RLS context if user address is present, but doesn't require it
 * Useful for routes that have both public and protected data
 */
export async function optionalRlsMiddleware(req, res, next) {
    try {
        const userAddress = extractUserAddress(req);
        if (userAddress) {
            await setRLSContext(prisma, userAddress);
            req.userAddress = userAddress;
        }
        next();
    }
    catch (error) {
        console.error('Optional RLS middleware error:', error);
        next(); // Continue even if RLS setup fails for optional middleware
    }
}
//# sourceMappingURL=rls.middleware.js.map
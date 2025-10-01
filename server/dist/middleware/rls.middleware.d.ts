import type { Request, Response, NextFunction } from 'express';
/**
 * Middleware to automatically set RLS context from request headers
 * This should be added to routes that require RLS protection
 */
export declare function rlsMiddleware(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * Optional middleware - sets RLS context if user address is present, but doesn't require it
 * Useful for routes that have both public and protected data
 */
export declare function optionalRlsMiddleware(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=rls.middleware.d.ts.map
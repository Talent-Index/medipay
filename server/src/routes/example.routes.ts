import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { rlsMiddleware, optionalRlsMiddleware } from '../middleware/rls.middleware';

const router = Router();

/**
 * Register user (public)
 * Creates or updates a user profile using wallet address as identity
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { address, email, name, role } = req.body as {
      address?: string;
      email?: string;
      name?: string;
      role?: string; // expects one of: PATIENT | DOCTOR | INSTITUTION | INSURANCE (case-insensitive supported)
    };

    if (!address || !email || !name) {
      res.status(400).json({ error: 'Missing required fields: address, email, name' });
      return;
    }

    // Normalize role to Prisma enum casing if provided; default to PATIENT
    const normalizedRole = (role || 'PATIENT').toString().toUpperCase();
    const allowedRoles = ['PATIENT', 'DOCTOR', 'INSTITUTION', 'INSURANCE'];
    const roleValue = allowedRoles.includes(normalizedRole) ? normalizedRole : 'PATIENT';

    // Upsert by unique wallet address; keep address as the identity key
    const user = await prisma.user.upsert({
      where: { address },
      update: {
        email,
        name,
        role: roleValue as any,
      },
      create: {
        address,
        email,
        name,
        role: roleValue as any,
      },
      select: {
        id: true,
        address: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    res.json({ success: true, data: user });
  } catch (error: any) {
    // Handle unique constraint on email gracefully
    if (error?.code === 'P2002') {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

/**
 * Login user (public)
 * Authenticates user by wallet address and returns user profile
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { address, email, password } = req.body as { address?: string; email?: string; password?: string };

    // Wallet-based login
    if (address) {
      const user = await prisma.user.findUnique({
        where: { address },
        select: {
          id: true,
          address: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true,
        },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found. Please register first.' });
        return;
      }

      res.json({ success: true, data: user });
      return;
    }

    // Email/password login
    if (email && password) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          address: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true,
          passwordHash: true,
        },
      });

      if (!user || !user.passwordHash) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const { passwordHash, ...safeUser } = user as any;
      res.json({ success: true, data: safeUser });
      return;
    }

    res.status(400).json({ error: 'Provide either wallet address or email and password' });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Failed to login user' });
  }
});

/**
 * Set or update password (protected via wallet header)
 */
router.post('/set-password', rlsMiddleware, async (req: Request, res: Response) => {
  try {
    const userAddress = (req as any).userAddress as string;
    const { password } = req.body as { password?: string };
    if (!password || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const hash = await bcrypt.hash(password, 10);
    const updated = await prisma.user.update({
      where: { address: userAddress },
      data: { passwordHash: hash },
      select: {
        id: true,
        address: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error setting password:', error);
    res.status(500).json({ error: 'Failed to set password' });
  }
});

/**
 * Example: Get user's invoices (RLS protected)
 * Only returns invoices the authenticated user can access
 */
router.get('/invoices', rlsMiddleware, async (req: Request, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        patient: { select: { name: true, email: true } },
        doctor: { select: { name: true, email: true } },
        institution: { select: { name: true } },
      },
    });

    res.json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

/**
 * Example: Get user's medical records (RLS protected)
 * Patients see their own records, doctors see their patients' records
 */
router.get('/medical-records', rlsMiddleware, async (req: Request, res: Response) => {
  try {
    const records = await prisma.medicalRecord.findMany({
      include: {
        patient: { select: { name: true, email: true } },
        doctor: { select: { name: true } },
      },
      orderBy: { visitDate: 'desc' },
    });

    res.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({ error: 'Failed to fetch medical records' });
  }
});

/**
 * Example: Get user's prescriptions (RLS protected)
 */
router.get('/prescriptions', rlsMiddleware, async (req: Request, res: Response) => {
  try {
    const prescriptions = await prisma.prescription.findMany({
      include: {
        patient: { select: { name: true, email: true } },
        doctor: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      count: prescriptions.length,
      data: prescriptions,
    });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

/**
 * Example: Get insurance packages (public data)
 * Available to everyone, no RLS required
 */
router.get('/insurance-packages', optionalRlsMiddleware, async (req: Request, res: Response) => {
  try {
    const packages = await prisma.insurancePackage.findMany({
      include: {
        services: true,
      },
    });

    res.json({
      success: true,
      count: packages.length,
      data: packages,
    });
  } catch (error) {
    console.error('Error fetching insurance packages:', error);
    res.status(500).json({ error: 'Failed to fetch insurance packages' });
  }
});

/**
 * Example: Get user's insurance (RLS protected)
 */
router.get('/my-insurance', rlsMiddleware, async (req: Request, res: Response) => {
  try {
    const insurance = await prisma.patientInsurance.findMany({
      include: {
        insurancePackage: {
          include: {
            services: true,
          },
        },
      },
    });

    res.json({
      success: true,
      count: insurance.length,
      data: insurance,
    });
  } catch (error) {
    console.error('Error fetching patient insurance:', error);
    res.status(500).json({ error: 'Failed to fetch insurance' });
  }
});

/**
 * Example: Get user's profile (RLS protected)
 */
router.get('/profile', rlsMiddleware, async (req: Request, res: Response) => {
  try {
    const userAddress = (req as any).userAddress;
    
    const user = await prisma.user.findUnique({
      where: { address: userAddress },
      select: {
        id: true,
        address: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * Update user's profile (RLS protected)
 */
router.put('/profile', rlsMiddleware, async (req: Request, res: Response) => {
  try {
    const userAddress = (req as any).userAddress as string;
    const { name, email, phone, avatar } = req.body as Partial<{ name: string; email: string; phone: string; avatar: string }>;

    const updated = await prisma.user.update({
      where: { address: userAddress },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(avatar !== undefined ? { avatar } : {}),
      },
      select: {
        id: true,
        address: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * Example: Get products (public data)
 */
router.get('/products', optionalRlsMiddleware, async (req: Request, res: Response) => {
  try {
    const { category, institutionId } = req.query;
    
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(category && { category: category as string }),
        ...(institutionId && { institutionId: institutionId as string }),
      },
      include: {
        institution: {
          select: {
            name: true,
            address: true,
          },
        },
      },
    });

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

export default router;

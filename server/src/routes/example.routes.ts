import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { rlsMiddleware, optionalRlsMiddleware } from '../middleware/rls.middleware';
import bcrypt from 'bcryptjs';

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
 * Authenticates user by wallet address or email and password, and returns user profile
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { address, email, password } = req.body as { address?: string; email?: string; password?: string };

    if (!address && !(email && password)) {
      res.status(400).json({ error: 'Wallet address or email and password are required' });
      return;
    }

    let user;

    if (email && password) {
      // Find user by email
      user = await prisma.user.findUnique({
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

      if (!user) {
        res.status(404).json({ error: 'User not found. Please register first.' });
        return;
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.passwordHash || '');
      if (!passwordMatch) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      // Remove passwordHash from user object before sending response
      const { passwordHash, ...userWithoutPassword } = user;
      user = userWithoutPassword;
    } else if (address) {
      // Find user by wallet address
      user = await prisma.user.findUnique({
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
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Failed to login user' });
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

/**
 * Example: Get insurance claims (RLS protected)
 * Insurance companies see claims for their patients
 */
router.get('/insurance-claims', rlsMiddleware, async (req: Request, res: Response) => {
  try {
    // For insurance companies, return claims from invoices where patients have insurance from this company
    const claims = await prisma.invoice.findMany({
      where: {
        status: {
          in: ['PENDING', 'PAID', 'APPROVED']
        }
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
          },
        },
        doctor: {
          select: {
            name: true,
            email: true,
          },
        },
        institution: {
          select: {
            name: true,
            address: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to match frontend expectations
    const transformedClaims = claims.map((invoice: any) => ({
      id: invoice.id,
      patientId: invoice.patient.id,
      institutionId: invoice.institution.id,
      service: invoice.serviceDescription || 'Medical Service',
      amount: invoice.totalAmount,
      status: invoice.status,
      processedDate: invoice.createdAt.toISOString(),
      claimId: `CLAIM-${invoice.id}`,
      patientName: invoice.patient.name,
      institutionName: invoice.institution.name,
    }));

    res.json({
      success: true,
      count: transformedClaims.length,
      data: transformedClaims,
    });
  } catch (error) {
    console.error('Error fetching insurance claims:', error);
    res.status(500).json({ error: 'Failed to fetch insurance claims' });
  }
});

/**
 * Example: Get insurance patients (RLS protected)
 * Insurance companies see patients who have their insurance
 */
router.get('/insurance-patients', rlsMiddleware, async (req: Request, res: Response) => {
  try {
    // Get patients who have insurance from this insurance company
    const patients = await prisma.patientInsurance.findMany({
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            createdAt: true,
          },
        },
        insurancePackage: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Transform to match frontend expectations
    const transformedPatients = patients.map((pi: any) => ({
      id: pi.patient.id,
      name: pi.patient.name,
      email: pi.patient.email,
      phone: pi.patient.phone || '',
      policyId: pi.insurancePackage.id,
      policyName: pi.insurancePackage.name,
      enrolledDate: pi.patient.createdAt.toISOString(),
      status: new Date() <= pi.coverageEnd ? 'active' : 'inactive',
    }));

    res.json({
      success: true,
      count: transformedPatients.length,
      data: transformedPatients,
    });
  } catch (error) {
    console.error('Error fetching insurance patients:', error);
    res.status(500).json({ error: 'Failed to fetch insurance patients' });
  }
});

/**
 * Example: Get institution invoices (RLS protected)
 * Institutions see invoices for their services
 */
router.get('/institution/invoices', rlsMiddleware, async (req: Request, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        patient: { select: { name: true, email: true } },
        doctor: { select: { name: true, email: true } },
        institution: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  } catch (error) {
    console.error('Error fetching institution invoices:', error);
    res.status(500).json({ error: 'Failed to fetch institution invoices' });
  }
});

/**
 * Example: Get institution transactions (RLS protected)
 * Institutions see their transaction history
 */
router.get('/institution/transactions', rlsMiddleware, async (req: Request, res: Response) => {
  try {
    // For now, return invoices as transactions - in a real app this might be a separate transactions table
    const transactions = await prisma.invoice.findMany({
      include: {
        patient: { select: { name: true, email: true } },
        doctor: { select: { name: true, email: true } },
        institution: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform invoices to transaction format
    const transformedTransactions = transactions.map((invoice: any) => ({
      id: invoice.id,
      type: 'invoice',
      amount: invoice.totalAmount,
      status: invoice.status,
      date: invoice.createdAt.toISOString(),
      patientName: invoice.patient.name,
      doctorName: invoice.doctor.name,
      service: invoice.serviceDescription || 'Medical Service',
    }));

    res.json({
      success: true,
      count: transformedTransactions.length,
      data: transformedTransactions,
    });
  } catch (error) {
    console.error('Error fetching institution transactions:', error);
    res.status(500).json({ error: 'Failed to fetch institution transactions' });
  }
});

/**
 * Example: Get institution users (RLS protected)
 * Institutions see users associated with them (patients, doctors, etc.)
 */
router.get('/institution/users', rlsMiddleware, async (req: Request, res: Response) => {
  try {
    // Get users who have interacted with this institution through invoices
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            patientInvoices: {
              some: {}
            }
          },
          {
            doctorInvoices: {
              some: {}
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        address: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching institution users:', error);
    res.status(500).json({ error: 'Failed to fetch institution users' });
  }
});

/**
 * Example: Get institution payments (RLS protected)
 * Institutions see payments they've received
 */
router.get('/institution/payments', rlsMiddleware, async (req: Request, res: Response) => {
  try {
    // Get paid invoices as payments received by the institution
    const payments = await prisma.invoice.findMany({
      where: {
        status: 'PAID'
      },
      include: {
        patient: { select: { name: true, email: true } },
        doctor: { select: { name: true, email: true } },
        institution: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to payment format
    const transformedPayments = payments.map((invoice: any) => ({
      id: invoice.id,
      amount: invoice.totalAmount,
      date: invoice.createdAt.toISOString(),
      patientName: invoice.patient.name,
      doctorName: invoice.doctor.name,
      service: invoice.serviceDescription || 'Medical Service',
      status: 'completed',
    }));

    res.json({
      success: true,
      count: transformedPayments.length,
      data: transformedPayments,
    });
  } catch (error) {
    console.error('Error fetching institution payments:', error);
    res.status(500).json({ error: 'Failed to fetch institution payments' });
  }
});

export default router;

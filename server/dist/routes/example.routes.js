import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { rlsMiddleware, optionalRlsMiddleware } from '../middleware/rls.middleware';
const router = Router();
/**
 * Example: Get user's invoices (RLS protected)
 * Only returns invoices the authenticated user can access
 */
router.get('/invoices', rlsMiddleware, async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
});
/**
 * Example: Get user's medical records (RLS protected)
 * Patients see their own records, doctors see their patients' records
 */
router.get('/medical-records', rlsMiddleware, async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching medical records:', error);
        res.status(500).json({ error: 'Failed to fetch medical records' });
    }
});
/**
 * Example: Get user's prescriptions (RLS protected)
 */
router.get('/prescriptions', rlsMiddleware, async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching prescriptions:', error);
        res.status(500).json({ error: 'Failed to fetch prescriptions' });
    }
});
/**
 * Example: Get insurance packages (public data)
 * Available to everyone, no RLS required
 */
router.get('/insurance-packages', optionalRlsMiddleware, async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching insurance packages:', error);
        res.status(500).json({ error: 'Failed to fetch insurance packages' });
    }
});
/**
 * Example: Get user's insurance (RLS protected)
 */
router.get('/my-insurance', rlsMiddleware, async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching patient insurance:', error);
        res.status(500).json({ error: 'Failed to fetch insurance' });
    }
});
/**
 * Example: Get user's profile (RLS protected)
 */
router.get('/profile', rlsMiddleware, async (req, res) => {
    try {
        const userAddress = req.userAddress;
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
    }
    catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});
/**
 * Example: Get products (public data)
 */
router.get('/products', optionalRlsMiddleware, async (req, res) => {
    try {
        const { category, institutionId } = req.query;
        const products = await prisma.product.findMany({
            where: {
                isActive: true,
                ...(category && { category: category }),
                ...(institutionId && { institutionId: institutionId }),
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
    }
    catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});
export default router;
//# sourceMappingURL=example.routes.js.map
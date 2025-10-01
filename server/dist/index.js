import path from 'node:path';
import dotenv from 'dotenv';
import express, {} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { prisma, gracefullyShutdownPrisma } from './lib/prisma';
import exampleRoutes from './routes/example.routes';
// Load env from server/.env then fall back to repo root .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
if (!process.env.DATABASE_URL) {
    dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });
}
const app = express();
app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});
// API Routes with RLS protection
app.use('/api', exampleRoutes);
// Not found handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', path: req.path });
});
// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, _req, res, _next) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const message = isProduction ? 'Internal Server Error' : err.message;
    res.status(500).json({ error: message });
});
const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${PORT}`);
});
process.on('SIGINT', async () => {
    await gracefullyShutdownPrisma();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await gracefullyShutdownPrisma();
    process.exit(0);
});
export default app;
//# sourceMappingURL=index.js.map
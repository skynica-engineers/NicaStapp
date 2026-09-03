import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes';
import catalogRoutes from './routes/catalogRoutes';
import feedRoutes from './routes/feedRoutes';
import deportesRoutes from './routes/deportesRoutes';
import torneosRoutes from './routes/torneosRoutes';
import organizacionesRoutes from './routes/organizacionesRoutes';
import encuentrosRoutes from './routes/encuentrosRoutes';
import perfilRoutes from './routes/perfilRoutes';
import metricasRoutes from './routes/metricasRoutes';
import equiposRoutes from './routes/equiposRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/deportes', deportesRoutes);
app.use('/api/torneos', torneosRoutes);
app.use('/api/organizaciones', organizacionesRoutes);
app.use('/api/encuentros', encuentrosRoutes);
app.use('/api/perfiles', perfilRoutes);
app.use('/api/metricas', metricasRoutes);
app.use('/api/equipos', equiposRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Backend NicaStapp running OK!');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

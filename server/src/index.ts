import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { config } from './config';

import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import questionRoutes from './routes/questionRoutes';
import testRoutes from './routes/testRoutes';
import submissionRoutes from './routes/submissionRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import teamRoutes from './routes/teamRoutes';

const app = express();

// Security and utility middleware
app.use(helmet({
  contentSecurityPolicy: false, // allow embedding YouTube videos & external sports images
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'VoleiTactics API',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv,
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/teams', teamRoutes);

// In Production (Render), serve client build
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res) => {
  // Never return index.html for missing assets, scripts or API routes
  if (req.path.startsWith('/api') || req.path.startsWith('/assets') || req.path.startsWith('/icons')) {
    return res.status(404).send('Recurso no encontrado');
  }
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err && !res.headersSent) {
      res.status(500).send('Error cargando la aplicación');
    }
  });
});

app.listen(config.port, () => {
  console.log(`🏐 VoleiTactics Server is running on port ${config.port} (env: ${config.nodeEnv})`);
  console.log(`📡 Ready for Render and Neon PostgreSQL`);
});

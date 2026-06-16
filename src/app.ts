import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';

import authRouter from './frameworks/web/routes/auth';
import expensesRouter from './frameworks/web/routes/expenses';
import categoriesRouter from './frameworks/web/routes/categories';
import ocrRouter from './frameworks/web/routes/ocr';
import analyticsRouter from './frameworks/web/routes/analytics';
import { errorMiddleware } from './frameworks/web/middlewares/errorMiddleware';

const app = express();

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse incoming JSON payloads
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// HTTP request logger middleware
app.use(morgan('dev'));

// Register API endpoints
app.use('/api/auth', authRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/ocr', ocrRouter);
app.use('/api/analytics', analyticsRouter);

// Serve static frontend files from public folder
const publicPath = path.resolve(__dirname, '../public');
app.use(express.static(publicPath));

// Fallback to serving login page for unknown routes (makes it single page-like or resolves simple HTML routing)
app.get('*', (req, res, next) => {
  // If it's an API request that didn't match, return 404 JSON
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: `API endpoint '${req.path}' not found`,
    });
  }
  
  // Otherwise, serve index.html (or login.html depending on how auth is handled)
  return res.sendFile(path.join(publicPath, 'login.html'), (err) => {
    if (err) {
      res.status(404).send('PocketPetal Web Portal could not be loaded. Please ensure the public directory is seeded.');
    }
  });
});

// Global error handling middleware (must be registered last)
app.use(errorMiddleware);

export { app };

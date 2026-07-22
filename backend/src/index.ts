import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db/connection';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import productRoutes from './routes/products';
import challanRoutes from './routes/challans';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/challans', challanRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handler (must be last)
app.use(errorHandler);

// Initialize and start server
async function start() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    console.log('Starting server anyway on port', PORT);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (database connection failed)`);
    });
  }
}

start();

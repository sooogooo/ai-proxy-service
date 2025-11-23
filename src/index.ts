import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config';
import logger from './utils/logger';
import { authMiddleware } from './middleware/auth';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { createProxy } from './proxy/createProxy';
import healthRoutes from './routes/health';

const app = express();

// Security middleware
app.use(helmet());

// Request logging
app.use(
  morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  })
);

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check routes (no auth required)
app.use(healthRoutes);

// Authentication middleware for proxy routes
app.use('/openai', authMiddleware, createProxy(config.proxies.openai));
app.use('/claude', authMiddleware, createProxy(config.proxies.claude));
app.use('/google', authMiddleware, createProxy(config.proxies.google));
app.use('/deepseek', authMiddleware, createProxy(config.proxies.deepseek));

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(config.port, () => {
  logger.info(`AI Proxy Service running on port ${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info('Available proxy routes:');
  logger.info(`  - /openai/* -> ${config.proxies.openai.target}`);
  logger.info(`  - /claude/* -> ${config.proxies.claude.target}`);
  logger.info(`  - /google/* -> ${config.proxies.google.target}`);
  logger.info(`  - /deepseek/* -> ${config.proxies.deepseek.target}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;

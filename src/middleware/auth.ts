import { Request, Response, NextFunction } from 'express';
import config from '../config';
import logger from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  apiKey?: string;
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  // Skip auth in development if no API key is configured
  if (config.nodeEnv === 'development' && !config.apiKey) {
    return next();
  }

  const authHeader = req.headers.authorization;
  const apiKeyHeader = req.headers['x-api-key'] as string;

  let providedKey: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    providedKey = authHeader.substring(7);
  } else if (apiKeyHeader) {
    providedKey = apiKeyHeader;
  }

  if (!providedKey) {
    logger.warn(`Unauthorized request from ${req.ip} - No API key provided`);
    res.status(401).json({
      error: 'Unauthorized',
      message: 'API key is required',
    });
    return;
  }

  if (providedKey !== config.apiKey) {
    logger.warn(`Unauthorized request from ${req.ip} - Invalid API key`);
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid API key',
    });
    return;
  }

  req.apiKey = providedKey;
  next();
};

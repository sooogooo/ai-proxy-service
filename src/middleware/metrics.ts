import { Request, Response, NextFunction } from 'express';
import { recordRequest, activeConnections } from '../utils/metrics';

export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = process.hrtime();

  // Increment active connections
  activeConnections.inc();

  // Override res.end to capture metrics
  const originalEnd = res.end.bind(res);

  res.end = function (
    this: Response,
    ...args: Parameters<Response['end']>
  ): Response {
    // Calculate duration
    const diff = process.hrtime(startTime);
    const duration = diff[0] + diff[1] / 1e9;

    // Get path without query params and normalize
    const path = normalizePath(req.path);

    // Record metrics
    recordRequest(req.method, path, res.statusCode, duration);

    // Decrement active connections
    activeConnections.dec();

    // Call original end
    return originalEnd(...args);
  };

  next();
};

// Normalize paths to avoid high cardinality
const normalizePath = (path: string): string => {
  // Replace UUIDs
  let normalized = path.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    ':id'
  );

  // Replace numeric IDs
  normalized = normalized.replace(/\/\d+/g, '/:id');

  // Normalize proxy paths
  if (normalized.startsWith('/openai')) {
    normalized = '/openai/*';
  } else if (normalized.startsWith('/claude')) {
    normalized = '/claude/*';
  } else if (normalized.startsWith('/google')) {
    normalized = '/google/*';
  } else if (normalized.startsWith('/deepseek')) {
    normalized = '/deepseek/*';
  }

  return normalized;
};

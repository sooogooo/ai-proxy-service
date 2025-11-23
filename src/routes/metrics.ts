import { Router, Request, Response } from 'express';
import register from '../utils/metrics';
import { circuitBreakers } from '../utils/circuitBreaker';

const router = Router();

// Prometheus metrics endpoint
router.get('/metrics', async (_req: Request, res: Response) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end();
  }
});

// Circuit breaker status endpoint
router.get('/circuit-breakers', (_req: Request, res: Response) => {
  const status: Record<string, { state: string; isOpen: boolean }> = {};

  for (const [service, breaker] of Object.entries(circuitBreakers)) {
    status[service] = {
      state: breaker.getState(),
      isOpen: breaker.isOpen(),
    };
  }

  res.json({
    timestamp: new Date().toISOString(),
    circuitBreakers: status,
  });
});

export default router;

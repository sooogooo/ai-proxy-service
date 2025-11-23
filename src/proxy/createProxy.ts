import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { ProxyTarget } from '../config';
import logger from '../utils/logger';
import {
  recordProxyRequest,
  recordProxyError,
  updateCircuitBreakerState,
} from '../utils/metrics';
import { getCircuitBreaker } from '../utils/circuitBreaker';

export const createProxy = (proxyConfig: ProxyTarget): ReturnType<typeof createProxyMiddleware> => {
  const serviceName = proxyConfig.name.toLowerCase();
  const circuitBreaker = getCircuitBreaker(serviceName);

  const options: Options = {
    target: proxyConfig.target,
    changeOrigin: true,
    pathRewrite: proxyConfig.pathRewrite,
    on: {
      proxyReq: (proxyReq, req) => {
        // Store start time for duration calculation
        (req as Record<string, unknown>).proxyStartTime = Date.now();

        // Check circuit breaker state
        if (circuitBreaker.isOpen()) {
          logger.warn(`[${proxyConfig.name}] Circuit breaker is OPEN, request may fail`);
        }

        logger.info(`[${proxyConfig.name}] Proxying ${req.method} ${req.url} -> ${proxyConfig.target}`);
      },
      proxyRes: (proxyRes, req) => {
        const startTime = (req as Record<string, unknown>).proxyStartTime as number;
        const duration = (Date.now() - startTime) / 1000;

        logger.info(
          `[${proxyConfig.name}] Response ${proxyRes.statusCode} for ${req.method} ${req.url} (${duration.toFixed(3)}s)`
        );

        // Record metrics
        recordProxyRequest(serviceName, proxyRes.statusCode || 0, duration);

        // Update circuit breaker state metric
        updateCircuitBreakerState(serviceName, circuitBreaker.getState());
      },
      error: (err, req, res) => {
        const startTime = (req as Record<string, unknown>).proxyStartTime as number;
        const duration = startTime ? (Date.now() - startTime) / 1000 : 0;

        logger.error(`[${proxyConfig.name}] Proxy error for ${req.method} ${req.url}: ${err.message}`);

        // Record error metrics
        recordProxyError(serviceName, err.name || 'unknown');
        recordProxyRequest(serviceName, 502, duration);

        // Update circuit breaker state metric
        updateCircuitBreakerState(serviceName, circuitBreaker.getState());

        if (res && 'writeHead' in res && typeof res.writeHead === 'function') {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              error: 'Bad Gateway',
              message: `Failed to proxy request to ${proxyConfig.name}`,
              circuitBreakerState: circuitBreaker.getState(),
            })
          );
        }
      },
    },
  };

  return createProxyMiddleware(options);
};

import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { ProxyTarget } from '../config';
import logger from '../utils/logger';

export const createProxy = (proxyConfig: ProxyTarget): ReturnType<typeof createProxyMiddleware> => {
  const options: Options = {
    target: proxyConfig.target,
    changeOrigin: true,
    pathRewrite: proxyConfig.pathRewrite,
    on: {
      proxyReq: (proxyReq, req) => {
        logger.info(`[${proxyConfig.name}] Proxying ${req.method} ${req.url} -> ${proxyConfig.target}`);
      },
      proxyRes: (proxyRes, req) => {
        logger.info(
          `[${proxyConfig.name}] Response ${proxyRes.statusCode} for ${req.method} ${req.url}`
        );
      },
      error: (err, req, res) => {
        logger.error(`[${proxyConfig.name}] Proxy error for ${req.method} ${req.url}: ${err.message}`);
        if (res && 'writeHead' in res && typeof res.writeHead === 'function') {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              error: 'Bad Gateway',
              message: `Failed to proxy request to ${proxyConfig.name}`,
            })
          );
        }
      },
    },
  };

  return createProxyMiddleware(options);
};

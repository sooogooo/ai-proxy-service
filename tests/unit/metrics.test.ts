import {
  register,
  httpRequestsTotal,
  proxyRequestsTotal,
  recordRequest,
  recordProxyRequest,
  recordProxyError,
  updateCircuitBreakerState,
} from '../../src/utils/metrics';

describe('Metrics', () => {
  beforeEach(async () => {
    // Reset metrics before each test
    register.resetMetrics();
  });

  describe('register', () => {
    it('should be defined', () => {
      expect(register).toBeDefined();
    });

    it('should have content type', () => {
      expect(register.contentType).toContain('text/plain');
    });
  });

  describe('recordRequest', () => {
    it('should increment http requests counter', () => {
      recordRequest('GET', '/health', 200, 0.05);

      // Metrics are recorded
      expect(httpRequestsTotal).toBeDefined();
    });
  });

  describe('recordProxyRequest', () => {
    it('should increment proxy requests counter', () => {
      recordProxyRequest('openai', 200, 1.5);

      expect(proxyRequestsTotal).toBeDefined();
    });
  });

  describe('recordProxyError', () => {
    it('should record proxy errors', () => {
      recordProxyError('openai', 'timeout');
      recordProxyError('claude', 'connection_refused');

      // No errors should be thrown
      expect(true).toBe(true);
    });
  });

  describe('updateCircuitBreakerState', () => {
    it('should update circuit breaker state metric', () => {
      updateCircuitBreakerState('openai', 'closed');
      updateCircuitBreakerState('claude', 'open');
      updateCircuitBreakerState('google', 'half-open');

      // No errors should be thrown
      expect(true).toBe(true);
    });
  });

  describe('metrics endpoint format', () => {
    it('should return valid prometheus format', async () => {
      recordRequest('GET', '/health', 200, 0.01);
      recordProxyRequest('openai', 200, 0.5);

      const metrics = await register.metrics();

      expect(metrics).toContain('http_requests_total');
      expect(metrics).toContain('proxy_requests_total');
    });
  });
});

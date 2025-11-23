import { ServiceCircuitBreaker, getCircuitBreaker, circuitBreakers } from '../../src/utils/circuitBreaker';

describe('Circuit Breaker', () => {
  describe('ServiceCircuitBreaker', () => {
    let breaker: ServiceCircuitBreaker;

    beforeEach(() => {
      breaker = new ServiceCircuitBreaker('TestService', {
        maxRetries: 2,
        consecutiveFailures: 3,
        halfOpenAfter: 1000,
      });
    });

    it('should start in closed state', () => {
      expect(breaker.getState()).toBe('closed');
      expect(breaker.isOpen()).toBe(false);
    });

    it('should execute successful operations', async () => {
      const result = await breaker.execute(async () => 'success');
      expect(result).toBe('success');
    });

    it('should retry failed operations', async () => {
      let attempts = 0;
      const result = await breaker.execute(async () => {
        attempts++;
        if (attempts < 2) {
          throw new Error('Temporary failure');
        }
        return 'success after retry';
      });

      expect(result).toBe('success after retry');
      expect(attempts).toBe(2);
    });
  });

  describe('getCircuitBreaker', () => {
    it('should return existing circuit breaker for known services', () => {
      const openaiBreaker = getCircuitBreaker('openai');
      expect(openaiBreaker).toBe(circuitBreakers.openai);
    });

    it('should create new circuit breaker for unknown services', () => {
      const customBreaker = getCircuitBreaker('custom-service');
      expect(customBreaker).toBeDefined();
      expect(customBreaker.getState()).toBe('closed');
    });
  });

  describe('circuitBreakers', () => {
    it('should have circuit breakers for all services', () => {
      expect(circuitBreakers.openai).toBeDefined();
      expect(circuitBreakers.claude).toBeDefined();
      expect(circuitBreakers.google).toBeDefined();
      expect(circuitBreakers.deepseek).toBeDefined();
    });

    it('should all start in closed state', () => {
      for (const [, breaker] of Object.entries(circuitBreakers)) {
        expect(breaker.getState()).toBe('closed');
      }
    });
  });
});

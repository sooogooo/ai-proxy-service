import {
  CircuitBreakerPolicy,
  ConsecutiveBreaker,
  ExponentialBackoff,
  handleAll,
  retry,
  circuitBreaker,
  wrap,
  IPolicy,
} from 'cockatiel';
import logger from './logger';

export interface CircuitBreakerConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  consecutiveFailures: number;
  halfOpenAfter: number;
}

const defaultConfig: CircuitBreakerConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  consecutiveFailures: 5,
  halfOpenAfter: 30000,
};

export class ServiceCircuitBreaker {
  private policy: IPolicy;
  private serviceName: string;
  private circuitBreakerPolicy: CircuitBreakerPolicy;

  constructor(serviceName: string, config: Partial<CircuitBreakerConfig> = {}) {
    const finalConfig = { ...defaultConfig, ...config };
    this.serviceName = serviceName;

    // Retry policy with exponential backoff
    const retryPolicy = retry(handleAll, {
      maxAttempts: finalConfig.maxRetries,
      backoff: new ExponentialBackoff({
        initialDelay: finalConfig.initialDelay,
        maxDelay: finalConfig.maxDelay,
      }),
    });

    retryPolicy.onRetry(({ attempt, delay }) => {
      logger.warn(
        `[${this.serviceName}] Retry attempt ${attempt} after ${delay}ms`
      );
    });

    // Circuit breaker policy
    this.circuitBreakerPolicy = circuitBreaker(handleAll, {
      breaker: new ConsecutiveBreaker(finalConfig.consecutiveFailures),
      halfOpenAfter: finalConfig.halfOpenAfter,
    });

    this.circuitBreakerPolicy.onBreak(() => {
      logger.error(`[${this.serviceName}] Circuit breaker OPENED - too many failures`);
    });

    this.circuitBreakerPolicy.onHalfOpen(() => {
      logger.info(`[${this.serviceName}] Circuit breaker HALF-OPEN - testing service`);
    });

    this.circuitBreakerPolicy.onReset(() => {
      logger.info(`[${this.serviceName}] Circuit breaker CLOSED - service recovered`);
    });

    // Combine policies: retry first, then circuit breaker
    this.policy = wrap(retryPolicy, this.circuitBreakerPolicy);
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return this.policy.execute(fn);
  }

  getState(): string {
    return this.circuitBreakerPolicy.state;
  }

  isOpen(): boolean {
    return this.circuitBreakerPolicy.state === 'open';
  }
}

// Create circuit breakers for each service
export const circuitBreakers: Record<string, ServiceCircuitBreaker> = {
  openai: new ServiceCircuitBreaker('OpenAI'),
  claude: new ServiceCircuitBreaker('Claude'),
  google: new ServiceCircuitBreaker('Google'),
  deepseek: new ServiceCircuitBreaker('Deepseek'),
};

export const getCircuitBreaker = (service: string): ServiceCircuitBreaker => {
  return circuitBreakers[service] || new ServiceCircuitBreaker(service);
};

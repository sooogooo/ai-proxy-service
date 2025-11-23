import client, { Registry, Counter, Histogram, Gauge } from 'prom-client';

// Create a custom registry
export const register = new Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// HTTP request metrics
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

// Proxy specific metrics
export const proxyRequestsTotal = new Counter({
  name: 'proxy_requests_total',
  help: 'Total number of proxy requests',
  labelNames: ['service', 'status'],
  registers: [register],
});

export const proxyRequestDuration = new Histogram({
  name: 'proxy_request_duration_seconds',
  help: 'Duration of proxy requests in seconds',
  labelNames: ['service'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
  registers: [register],
});

export const proxyErrorsTotal = new Counter({
  name: 'proxy_errors_total',
  help: 'Total number of proxy errors',
  labelNames: ['service', 'error_type'],
  registers: [register],
});

// Circuit breaker metrics
export const circuitBreakerState = new Gauge({
  name: 'circuit_breaker_state',
  help: 'Circuit breaker state (0=closed, 1=half-open, 2=open)',
  labelNames: ['service'],
  registers: [register],
});

export const circuitBreakerTrips = new Counter({
  name: 'circuit_breaker_trips_total',
  help: 'Total number of circuit breaker trips',
  labelNames: ['service'],
  registers: [register],
});

// Active connections
export const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register],
});

// Retry metrics
export const retryAttemptsTotal = new Counter({
  name: 'retry_attempts_total',
  help: 'Total number of retry attempts',
  labelNames: ['service'],
  registers: [register],
});

// Helper functions
export const recordRequest = (
  method: string,
  path: string,
  status: number,
  duration: number
): void => {
  httpRequestsTotal.inc({ method, path, status });
  httpRequestDuration.observe({ method, path, status }, duration);
};

export const recordProxyRequest = (
  service: string,
  status: number,
  duration: number
): void => {
  proxyRequestsTotal.inc({ service, status: status.toString() });
  proxyRequestDuration.observe({ service }, duration);
};

export const recordProxyError = (service: string, errorType: string): void => {
  proxyErrorsTotal.inc({ service, error_type: errorType });
};

export const updateCircuitBreakerState = (service: string, state: string): void => {
  const stateValue = state === 'closed' ? 0 : state === 'half-open' ? 1 : 2;
  circuitBreakerState.set({ service }, stateValue);
};

export const recordCircuitBreakerTrip = (service: string): void => {
  circuitBreakerTrips.inc({ service });
};

export const recordRetryAttempt = (service: string): void => {
  retryAttemptsTotal.inc({ service });
};

export default register;

import config from '../../src/config';

describe('Config', () => {
  it('should have default port 3000', () => {
    expect(config.port).toBe(3000);
  });

  it('should have proxy configurations for all services', () => {
    expect(config.proxies.openai).toBeDefined();
    expect(config.proxies.claude).toBeDefined();
    expect(config.proxies.google).toBeDefined();
    expect(config.proxies.deepseek).toBeDefined();
  });

  it('should have correct OpenAI proxy target', () => {
    expect(config.proxies.openai.target).toBe('https://api.openai.com');
    expect(config.proxies.openai.name).toBe('OpenAI');
  });

  it('should have correct Claude proxy target', () => {
    expect(config.proxies.claude.target).toBe('https://api.anthropic.com');
    expect(config.proxies.claude.name).toBe('Claude');
  });

  it('should have correct Google proxy target', () => {
    expect(config.proxies.google.target).toBe('https://generativelanguage.googleapis.com');
    expect(config.proxies.google.name).toBe('Google');
  });

  it('should have correct Deepseek proxy target', () => {
    expect(config.proxies.deepseek.target).toBe('https://api.deepseek.com');
    expect(config.proxies.deepseek.name).toBe('Deepseek');
  });

  it('should have rate limit configuration', () => {
    expect(config.rateLimit).toBeDefined();
    expect(config.rateLimit.windowMs).toBeGreaterThan(0);
    expect(config.rateLimit.max).toBeGreaterThan(0);
  });
});

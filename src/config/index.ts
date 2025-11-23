import dotenv from 'dotenv';

dotenv.config();

export interface ProxyTarget {
  name: string;
  target: string;
  pathRewrite?: Record<string, string>;
}

export interface Config {
  port: number;
  nodeEnv: string;
  logLevel: string;
  apiKey: string;
  rateLimit: {
    windowMs: number;
    max: number;
  };
  proxies: {
    openai: ProxyTarget;
    claude: ProxyTarget;
    google: ProxyTarget;
    deepseek: ProxyTarget;
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  apiKey: process.env.API_KEY || '',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
  proxies: {
    openai: {
      name: 'OpenAI',
      target: process.env.OPENAI_API_URL || 'https://api.openai.com',
      pathRewrite: { '^/openai': '' },
    },
    claude: {
      name: 'Claude',
      target: process.env.CLAUDE_API_URL || 'https://api.anthropic.com',
      pathRewrite: { '^/claude': '' },
    },
    google: {
      name: 'Google',
      target:
        process.env.GOOGLE_API_URL || 'https://generativelanguage.googleapis.com',
      pathRewrite: { '^/google': '' },
    },
    deepseek: {
      name: 'Deepseek',
      target: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com',
      pathRewrite: { '^/deepseek': '' },
    },
  },
};

export default config;

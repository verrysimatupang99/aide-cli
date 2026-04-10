import Conf from 'conf';

export interface AideConfig {
  defaultProvider?: string;
  defaultModel?: string;
  apiKeys?: {
    openai?: string;
    anthropic?: string;
    google?: string;
  };
  ollamaBaseUrl?: string;
  theme?: 'dark' | 'light';
}

const store = new Conf<AideConfig>({
  projectName: 'aide-cli',
  defaults: {
    defaultProvider: 'anthropic',
    defaultModel: 'claude-3-5-sonnet-20241022',
  },
});

export function loadConfig(): AideConfig {
  return store.store;
}

export function saveConfig(config: Partial<AideConfig>): void {
  Object.entries(config).forEach(([key, value]) => {
    store.set(key as keyof AideConfig, value as AideConfig[keyof AideConfig]);
  });
}

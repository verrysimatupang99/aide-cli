#!/usr/bin/env node
import meow from 'meow';
import { render } from 'ink';
import React from 'react';
import { App } from './App.js';
import { loadConfig } from './config.js';

const cli = meow(
  `
  Usage
    $ aide [options]

  Options
    --mode, -m       Agent mode: architect | code | ask  (default: code)
    --provider, -p   AI provider: openai | anthropic | google | ollama
    --model          Model name override
    --cwd            Working directory (default: process.cwd())
    --version, -v    Show version

  Examples
    $ aide
    $ aide --mode architect
    $ aide --provider openai --model gpt-4o
    $ aide --provider ollama --model llama3
  `,
  {
    importMeta: import.meta,
    flags: {
      mode: { type: 'string', shortFlag: 'm', default: 'code' },
      provider: { type: 'string', shortFlag: 'p' },
      model: { type: 'string' },
      cwd: { type: 'string', default: process.cwd() },
    },
  }
);

const config = loadConfig();

const providerName = cli.flags.provider ?? config.defaultProvider ?? 'anthropic';
const modelName = cli.flags.model ?? config.defaultModel ?? 'claude-3-5-sonnet-20241022';

render(
  React.createElement(App, {
    mode: cli.flags.mode as 'architect' | 'code' | 'ask',
    workingDirectory: cli.flags.cwd,
    provider: providerName as 'openai' | 'anthropic' | 'google' | 'ollama',
    model: modelName,
    config,
  })
);

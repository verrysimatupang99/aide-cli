# AIDE — AI Coding Assistant

> A model-agnostic, terminal-first AI coding assistant with a polished TUI and cross-platform desktop app.

![License](https://img.shields.io/badge/license-MIT-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue) ![Node](https://img.shields.io/badge/node-%3E%3D20-green)

## Features

- **Terminal-first TUI** — Beautiful Ink/React terminal interface with chat, spinners, and mode selector
- **Desktop App** — Cross-platform Electron app for Windows, macOS, and Linux
- **Model-Agnostic** — Plug in keys for OpenAI, Anthropic, Google Gemini, or connect to local Ollama models
- **Three Agent Modes**:
  - ⚡ **Architect** — Full autonomy: reads files, writes code, runs shell commands
  - ✏️ **Code** — Read & write files; confirms before executing shell commands
  - 💬 **Ask** — Read-only planning mode; analyses code and suggests changes without touching anything
- **Agentic tool loop** — Agent autonomously calls tools (read_file, write_file, list_files, execute_command, search_code) in a loop until the task is complete
- **Monorepo** — Turbo-powered with shared `@aide/core` package

## Packages

| Package | Description |
|---|---|
| `packages/core` | Shared AI providers, agent loop, tool executors |
| `packages/tui` | Terminal UI (Ink + React) with `aide` CLI binary |
| `packages/desktop` | Electron desktop app (React renderer) |

## Quick Start

### Prerequisites

- Node.js >= 20
- pnpm >= 9 (`npm i -g pnpm`)

### Install & Build

```bash
git clone https://github.com/verrysimatupang99/aide-cli.git
cd aide-cli
pnpm install
pnpm build
```

### Configure

```bash
cp .env.example .env
# Edit .env with your API keys
```

### Run the TUI

```bash
# Default mode (code)
pnpm --filter @aide/tui dev

# Or after building, from anywhere:
npx aide
npx aide --mode architect
npx aide --provider openai --model gpt-4o
npx aide --provider ollama --model llama3
```

### Run the Desktop App

```bash
pnpm --filter @aide/desktop dev
```

### Package Desktop App for Distribution

```bash
pnpm --filter @aide/desktop package
# Output: packages/desktop/release/
```

## Agent Modes

| Mode | Read Files | Write Files | Run Commands |
|---|---|---|---|
| ⚡ Architect | ✅ | ✅ | ✅ Auto |
| ✏️ Code | ✅ | ✅ | ⚠️ Ask first |
| 💬 Ask | ✅ | ❌ | ❌ |

## Supported Models

| Provider | Example Models |
|---|---|
| Anthropic | claude-3-5-sonnet-20241022, claude-3-opus-20240229 |
| OpenAI | gpt-4o, gpt-4o-mini, o1-preview |
| Google | gemini-1.5-pro, gemini-1.5-flash |
| Ollama (local) | llama3, codestral, deepseek-coder, phi3 |

## Architecture

```
aide-cli/
├── packages/
│   ├── core/          # @aide/core — providers, agents, tools
│   │   └── src/
│   │       ├── providers/   # OpenAI, Anthropic, Google, Ollama
│   │       ├── agents/      # AideAgent (agentic loop)
│   │       └── tools/       # read_file, write_file, execute_command …
│   ├── tui/           # @aide/tui  — Ink terminal UI + CLI
│   └── desktop/       # @aide/desktop — Electron + React desktop app
├── turbo.json
└── package.json
```

## Contributing

PRs welcome! Please open an issue first for major changes.

## License

MIT

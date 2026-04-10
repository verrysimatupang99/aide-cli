import React from 'react';
import type { AgentMode, ModelConfig, ProviderName } from '@aide/core';

interface SidebarProps {
  mode: AgentMode;
  onModeChange: (mode: AgentMode) => void;
  cwd: string;
  onCwdChange: (cwd: string) => void;
  modelConfig: ModelConfig;
  onModelConfigChange: (config: ModelConfig) => void;
}

const MODES: { value: AgentMode; label: string; description: string }[] = [
  { value: 'architect', label: '⚡ Architect', description: 'Full autonomy' },
  { value: 'code', label: '✏️ Code', description: 'Read & write' },
  { value: 'ask', label: '💬 Ask', description: 'Read-only planning' },
];

const PROVIDERS: ProviderName[] = ['anthropic', 'openai', 'google', 'ollama'];

export const Sidebar: React.FC<SidebarProps> = ({
  mode,
  onModeChange,
  cwd,
  onCwdChange,
  modelConfig,
  onModelConfigChange,
}) => {
  const pickDirectory = async () => {
    const dir = await window.aide.pickDirectory();
    if (dir) onCwdChange(dir);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__section">
        <h3>Mode</h3>
        {MODES.map((m) => (
          <button
            key={m.value}
            className={`mode-btn ${mode === m.value ? 'mode-btn--active' : ''}`}
            onClick={() => onModeChange(m.value)}
          >
            <span>{m.label}</span>
            <small>{m.description}</small>
          </button>
        ))}
      </div>

      <div className="sidebar__section">
        <h3>Project Directory</h3>
        <div className="dir-picker">
          <span title={cwd}>{cwd.split('/').pop() || cwd}</span>
          <button onClick={pickDirectory}>Browse</button>
        </div>
      </div>

      <div className="sidebar__section">
        <h3>Model</h3>
        <select
          value={modelConfig.provider}
          onChange={(e) =>
            onModelConfigChange({ ...modelConfig, provider: e.target.value as ProviderName })
          }
        >
          {PROVIDERS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <input
          type="text"
          value={modelConfig.model}
          onChange={(e) => onModelConfigChange({ ...modelConfig, model: e.target.value })}
          placeholder="Model name"
        />
        <input
          type="password"
          value={modelConfig.apiKey ?? ''}
          onChange={(e) => onModelConfigChange({ ...modelConfig, apiKey: e.target.value })}
          placeholder="API Key (or set env var)"
        />
      </div>
    </aside>
  );
};

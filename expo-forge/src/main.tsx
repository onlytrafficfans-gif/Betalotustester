import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Download, RefreshCw } from 'lucide-react';
import './styles.css';

type Brief = {
  prompt: string;
  appName: string;
  bundleId: string;
  themeColor: string;
  previewModel: string;
  includeEas: boolean;
  includePreviewBuilds: boolean;
  includeStoreMetadata: boolean;
};

type PreviewModel = {
  id: string;
  label: string;
  use: string;
};

const initialBrief: Brief = {
  prompt: 'A premium restaurant reservation app with live table availability, menu highlights, guest notes, and a polished booking flow.',
  appName: 'TableGlow',
  bundleId: 'com.expoforge.tableglow',
  themeColor: '#B45309',
  previewModel: 'qwen/qwen3-235b-a22b:free',
  includeEas: true,
  includePreviewBuilds: true,
  includeStoreMetadata: true
};

function App() {
  const [brief, setBrief] = useState<Brief>(initialBrief);
  const [previewHtml, setPreviewHtml] = useState('');
  const [status, setStatus] = useState('Write a prompt. The preview is the product.');
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<PreviewModel[]>([]);
  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(() => {
    void loadModels();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void generatePreview();
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [brief.prompt, brief.appName, brief.themeColor, brief.previewModel]);

  const updateBrief = <Key extends keyof Brief>(key: Key, value: Brief[Key]) => {
    setBrief((current) => ({ ...current, [key]: value }));
  };

  async function loadModels() {
    try {
      const response = await fetch('/api/models');
      const data = await response.json();
      setModels(data.models ?? []);
      setAiEnabled(Boolean(data.enabled));
      if (data.defaultModel) {
        setBrief((current) => ({ ...current, previewModel: current.previewModel || data.defaultModel }));
      }
    } catch {
      setModels([]);
      setAiEnabled(false);
    }
  }

  async function generatePreview() {
    if (!brief.prompt.trim()) {
      setPreviewHtml('');
      setStatus('Add a prompt to generate the app preview.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brief)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Preview failed');
      setPreviewHtml(data.html);
      setStatus(
        data.source === 'openrouter'
          ? `Generated with OpenRouter: ${brief.previewModel}`
          : data.source === 'openai'
            ? 'Generated with OpenAI preview engine.'
            : 'Generated with local premium preview engine.'
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Preview failed');
    } finally {
      setIsLoading(false);
    }
  }

  async function downloadZip() {
    setIsLoading(true);
    setStatus('Building Expo project ZIP from this prompt...');
    try {
      const response = await fetch('/api/export.zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...brief,
          workflow: brief.prompt,
          audience: 'mobile users',
          appCategory: 'custom app',
          owner: 'ExpoForge'
        })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Export failed');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${brief.appName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'expo-app'}.zip`;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatus('Expo project ZIP downloaded.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="workspace">
      <section className="controls" aria-label="Prompt controls">
        <div className="title-block">
          <h1>ExpoForge</h1>
          <p>Prompt to real app preview first. Export comes after the preview is worth building.</p>
        </div>

        <label className="prompt-box">
          App prompt
          <textarea
            value={brief.prompt}
            onChange={(event) => updateBrief('prompt', event.target.value)}
            spellCheck={false}
          />
        </label>

        <div className="compact-row">
          <label>
            App name
            <input value={brief.appName} onChange={(event) => updateBrief('appName', event.target.value)} />
          </label>
          <label>
            Color
            <input type="color" value={brief.themeColor} onChange={(event) => updateBrief('themeColor', event.target.value)} />
          </label>
        </div>

        <label>
          Bundle ID
          <input value={brief.bundleId} onChange={(event) => updateBrief('bundleId', event.target.value)} />
        </label>

        <label>
          Preview model
          <select value={brief.previewModel} onChange={(event) => updateBrief('previewModel', event.target.value)}>
            {models.length ? (
              models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.label} - {model.use}
                </option>
              ))
            ) : (
              <option value={brief.previewModel}>Qwen3 235B A22B - best free app-builder pick</option>
            )}
          </select>
        </label>

        <div className="switches">
          <Toggle label="EAS config" checked={brief.includeEas} onChange={(value) => updateBrief('includeEas', value)} />
          <Toggle label="Preview workflow" checked={brief.includePreviewBuilds} onChange={(value) => updateBrief('includePreviewBuilds', value)} />
          <Toggle label="Store metadata" checked={brief.includeStoreMetadata} onChange={(value) => updateBrief('includeStoreMetadata', value)} />
        </div>

        <div className="actions">
          <button type="button" onClick={generatePreview} disabled={isLoading || !brief.prompt.trim()}>
            <RefreshCw size={17} />
            Regenerate preview
          </button>
          <button type="button" onClick={downloadZip} disabled={isLoading || !brief.prompt.trim()}>
            <Download size={17} />
            Export Expo ZIP
          </button>
        </div>

        <p className="status">{aiEnabled ? status : `${status} Add OPENROUTER_API_KEY to activate the free model pool.`}</p>
      </section>

      <section className="preview-stage" aria-label="Generated app preview">
        {previewHtml ? (
          <iframe title="Generated app preview" srcDoc={previewHtml} />
        ) : (
          <div className="empty-preview">Your generated app preview will render here.</div>
        )}
      </section>
    </main>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="toggle">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

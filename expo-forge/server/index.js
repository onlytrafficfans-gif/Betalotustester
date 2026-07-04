import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { generateExpoProject } from './services/expoProjectGenerator.js';
import { generatePreviewHtml } from './services/previewGenerator.js';
import { canUseAiPreview, generateAiPreviewHtml, getAiPreviewStatus } from './services/aiPreviewGenerator.js';

const app = express();
const port = Number(process.env.PORT || 8787);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, '../dist');

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'expo-forge',
    aiPreview: canUseAiPreview(),
    ai: getAiPreviewStatus(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/models', (_req, res) => {
  res.json(getAiPreviewStatus());
});

app.post('/api/generate', async (req, res) => {
  try {
    const project = generateExpoProject(req.body);
    const { html: previewHtml, source } = await generateBestPreview(req.body);
    res.json({
      projectName: project.projectName,
      fileCount: project.files.length,
      previewHtml,
      previewSource: source,
      files: project.files.map((file) => ({ path: file.path, bytes: Buffer.byteLength(file.content) }))
    });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid app brief' });
  }
});

app.post('/api/preview', async (req, res) => {
  try {
    const preview = await generateBestPreview(req.body);
    res.json(preview);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid app prompt' });
  }
});

async function generateBestPreview(input) {
  if (canUseAiPreview()) {
    try {
      const html = await generateAiPreviewHtml(input);
      if (html) return { html, source: process.env.OPENROUTER_API_KEY ? 'openrouter' : 'openai' };
    } catch (error) {
      console.warn('[preview] AI generation failed, using local generator:', error instanceof Error ? error.message : error);
    }
  }
  return { html: generatePreviewHtml(input), source: 'local' };
}

app.post('/api/export.zip', async (req, res) => {
  try {
    const project = generateExpoProject(req.body);
    const zip = new JSZip();
    for (const file of project.files) {
      zip.file(file.path, file.content);
    }
    const buffer = await zip.generateAsync({ type: 'nodebuffer' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${project.projectName}.zip"`);
    res.send(buffer);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid app brief' });
  }
});

app.use(express.static(clientDist));
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(port, () => {
  console.log(`ExpoForge API running at http://localhost:${port}`);
});

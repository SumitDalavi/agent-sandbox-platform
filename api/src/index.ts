import express from 'express';
import cors from 'cors';
import { Sandbox } from '../../sandbox-engine/src/engine';

const app = express();
app.use(express.json());
app.use(cors());

// In-memory store for demo
const sandboxes: Record<string, Sandbox> = {};
const auditLog: Array<{ timestamp: Date, containerId: string, cmd: string, allowed: boolean, stdout?: string, stderr?: string, error?: string }> = [];

app.post('/api/sandbox', async (req, res) => {
  try {
    const sandbox = await Sandbox.create();
    sandboxes[sandbox.containerId] = sandbox;
    res.json({ containerId: sandbox.containerId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

import crypto from 'crypto';

app.post('/api/sandbox/:id/propose', (req, res) => {
  const { cmd } = req.body;
  if (!cmd) return res.status(400).json({ error: 'cmd is required' });
  const proposalHash = crypto.createHash('sha256').update(cmd).digest('hex');
  res.json({ proposalHash });
});

app.post('/api/sandbox/:id/execute', async (req, res) => {
  const { id } = req.params;
  const { cmd, proposalHash } = req.body;
  
  if (!sandboxes[id]) {
    return res.status(404).json({ error: 'Sandbox not found' });
  }

  // Bind execution to proposal hash to ensure what was approved is what runs
  if (!proposalHash) {
    return res.status(400).json({ error: 'proposalHash is required' });
  }
  const expectedHash = crypto.createHash('sha256').update(cmd).digest('hex');
  if (proposalHash !== expectedHash) {
    return res.status(403).json({ error: 'Invalid proposalHash. Execution parameters do not match approval.' });
  }

  const sandbox = sandboxes[id];
  try {
    const { stdout, stderr } = await sandbox.executeCommand(cmd);
    auditLog.push({ timestamp: new Date(), containerId: id, cmd, allowed: true, stdout, stderr });
    res.json({ status: 'success', stdout, stderr });
  } catch (err: any) {
    auditLog.push({ timestamp: new Date(), containerId: id, cmd, allowed: false, error: err.message });
    res.status(403).json({ error: err.message }); // 403 for policy violations
  }
});

app.delete('/api/sandbox/:id', async (req, res) => {
  const { id } = req.params;
  if (!sandboxes[id]) {
    return res.status(404).json({ error: 'Sandbox not found' });
  }
  
  try {
    await sandboxes[id].destroy();
    delete sandboxes[id];
    res.json({ status: 'destroyed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/audit', (req, res) => {
  res.json({ logs: auditLog });
});

app.listen(3000, () => {
  console.log('Sandbox API running on port 3000');
});

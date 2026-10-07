import express from 'express';
import cors from 'cors';
import { Sandbox } from '../../sandbox-engine/src/engine';

const app = express();
app.use(express.json());
app.use(cors());

// In-memory store for demo
const sandboxes: Record<string, Sandbox> = {};
const auditLog: Array<{ timestamp: Date, containerId: string, cmd: string, allowed: boolean, stdout?: string, stderr?: string, error?: string }> = [];
const proposals: Record<string, { cmd: string, approved: boolean, approver?: string, expiresAt: number }> = {};

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
  const proposalHash = crypto.createHash('sha256').update(cmd + Date.now().toString()).digest('hex');
  
  proposals[proposalHash] = {
    cmd,
    approved: false,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
  };
  
  res.json({ proposalHash });
});

app.post('/api/sandbox/:id/approve', (req, res) => {
  const { proposalHash, approver } = req.body;
  if (!proposals[proposalHash]) return res.status(404).json({ error: 'Proposal not found' });
  if (!approver) return res.status(401).json({ error: 'Approver identity required' });
  
  proposals[proposalHash].approved = true;
  proposals[proposalHash].approver = approver;
  res.json({ status: 'approved' });
});

app.post('/api/sandbox/:id/execute', async (req, res) => {
  const { id } = req.params;
  const { cmd, proposalHash } = req.body;
  
  if (!sandboxes[id]) {
    return res.status(404).json({ error: 'Sandbox not found' });
  }

  const proposal = proposals[proposalHash];
  if (!proposal) {
    return res.status(404).json({ error: 'Proposal not found or invalid hash.' });
  }
  
  if (!proposal.approved) {
    return res.status(403).json({ error: 'Proposal has not been approved.' });
  }
  
  if (proposal.cmd !== cmd) {
    return res.status(403).json({ error: 'Command does not match approved proposal.' });
  }
  
  if (Date.now() > proposal.expiresAt) {
    return res.status(403).json({ error: 'Proposal has expired.' });
  }
  
  // Burn the proposal (one-time use)
  delete proposals[proposalHash];

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

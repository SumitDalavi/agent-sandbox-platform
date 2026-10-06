import express from 'express';
import { executeInSandbox } from './sandbox';

const app = express();
app.use(express.json());

app.post('/api/execute', async (req, res) => {
  const { command, proposalId } = req.body;
  if (!proposalId) return res.status(400).send('Missing proposal approval');
  
  try {
    const result = await executeInSandbox(command);
    res.json({ status: 'success', output: result });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.listen(3000, () => console.log('Sandbox API listening on port 3000'));

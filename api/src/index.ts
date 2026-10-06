import express from 'express';
import cors from 'cors';
import { executeCommand } from '../sandbox-engine/src/engine';

const app = express();
app.use(express.json());
app.use(cors());

app.post('/api/execute', async (req, res) => {
  console.log([API] Received execution request for \);
  try {
    const output = await executeCommand(req.body.command);
    res.json({ success: true, output });
  } catch (err: any) {
    res.status(500).json({ success: false, output: err.message });
  }
});

app.listen(3000, () => console.log('Sandbox API on port 3000'));

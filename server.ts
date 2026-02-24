import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mock database for tables
interface Table {
  id: number;
  name: string;
  isLive: boolean;
  hasReplay: boolean;
  lastReplayTimestamp: number | null; // Unix timestamp
  streamUrl: string; // Mock URL
  replayUrl: string | null; // Mock URL
}

// Initialize 10 tables
const tables: Table[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Mesa ${i + 1}`,
  isLive: true,
  hasReplay: false,
  lastReplayTimestamp: null,
  streamUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Placeholder
  replayUrl: null,
}));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/tables', (req, res) => {
    res.json(tables);
  });

  app.get('/api/tables/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const table = tables.find((t) => t.id === id);
    if (table) {
      res.json(table);
    } else {
      res.status(404).json({ error: 'Table not found' });
    }
  });

  // Trigger Replay Endpoint (Simulates button press)
  app.post('/api/tables/:id/trigger', (req, res) => {
    const id = parseInt(req.params.id);
    const tableIndex = tables.findIndex((t) => t.id === id);

    if (tableIndex === -1) {
      return res.status(404).json({ error: 'Table not found' });
    }

    console.log(`[Server] Trigger received for Table ${id}`);

    // Simulate processing delay (FFmpeg cutting video)
    setTimeout(() => {
      console.log(`[Server] Replay ready for Table ${id}`);
      tables[tableIndex].hasReplay = true;
      tables[tableIndex].lastReplayTimestamp = Date.now();
      // In a real app, this would be a unique URL for the specific clip
      tables[tableIndex].replayUrl = 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'; 
    }, 3000); // 3 seconds processing time

    res.json({ status: 'processing', message: 'Replay generation started' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving (if needed later)
    app.use(express.static(path.resolve(__dirname, 'dist')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

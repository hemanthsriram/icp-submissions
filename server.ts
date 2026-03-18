import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { evaluateEligibility } from './src/utils/evaluation';
import { upsertStudentToExcel, getAllStudents, getExcelFilePath } from './server/excel';
import { saveSubmission, getAllSubmissions } from './server/db';
import { adminAuth } from './server/auth';
import { connectGoogleSheets, initializeSheetsClient, isSheetsConnected, syncToGoogleSheets } from './server/sheets';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// SSE Clients
let sseClients: any[] = [];

function notifyAdminClients() {
  sseClients.forEach(client => {
    client.res.write(`data: ${JSON.stringify({ type: 'UPDATE' })}\n\n`);
  });
}

// API Routes
app.post('/api/submit', async (req, res) => {
  try {
    const { studentData, results } = req.body;
    
    const resultsWithOther = evaluateEligibility(results, true);
    const resultsWithoutOther = evaluateEligibility(results, false);

    await upsertStudentToExcel(studentData, resultsWithOther, resultsWithoutOther);
    await saveSubmission({ studentData, results, resultsWithOther, resultsWithoutOther });
    
    // Trigger Sheets Sync
    if (isSheetsConnected()) {
      syncToGoogleSheets().catch(console.error);
    }

    notifyAdminClients();

    res.json({ success: true, resultsWithOther, resultsWithoutOther });
  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({ error: 'Failed to submit data' });
  }
});

// Admin Routes
app.get('/api/admin/dashboard', adminAuth, (req, res) => {
  const students = getAllStudents();
  const submissions = getAllSubmissions();
  res.json({ students, submissions });
});

app.get('/api/admin/download', adminAuth, (req, res) => {
  const filePath = getExcelFilePath();
  res.download(filePath, 'eligibility_master.xlsx', (err) => {
    if (err) {
      if (!res.headersSent) {
        res.status(404).send('File not found. No submissions yet.');
      }
    }
  });
});

app.get('/api/admin/stream', adminAuth, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  req.on('close', () => {
    sseClients = sseClients.filter(client => client.id !== clientId);
  });
});

app.post('/api/admin/sheets/connect', adminAuth, async (req, res) => {
  const { credentialsJson, sheetId } = req.body;
  const success = await connectGoogleSheets(credentialsJson, sheetId);
  if (success) {
    await syncToGoogleSheets();
    res.json({ success: true });
  } else {
    res.status(500).json({ error: 'Failed to connect' });
  }
});

app.post('/api/admin/sheets/sync', adminAuth, async (req, res) => {
  await syncToGoogleSheets();
  res.json({ success: true });
});

app.get('/api/admin/sheets/status', adminAuth, (req, res) => {
  res.json({ connected: isSheetsConnected() });
});

async function startServer() {
  // Initialize Sheets
  await initializeSheetsClient();

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT as number, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

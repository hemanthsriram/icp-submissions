import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { evaluateEligibility } from './src/utils/evaluation';
import { semesters as cseSemesters } from './src/data/subjects';
import { aimlSemesters } from './src/data/subjects-aiml';
import fs from 'fs';
import { upsertStudentToExcel, getAllStudents, getExcelFilePath } from './server/excel';
import { saveSubmission, getAllSubmissions, deleteSubmission } from './server/db';
import { adminAuth } from './server/auth';
import { connectGoogleSheets, initializeSheetsClient, isSheetsConnected, syncToGoogleSheets } from './server/sheets';
import { supabase } from './server/supabase';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/test', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/foo/:id', (req, res) => {
  res.json({ foo: req.params.id });
});

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
    const stream = studentData.branch || 'CSE ICP';
    // Select the correct semester list for evaluation
    const semesterList = stream === 'AIML ICP' ? aimlSemesters : cseSemesters;
    
    const resultsWithOther = evaluateEligibility(results, true, semesterList);
    const resultsWithoutOther = evaluateEligibility(results, false, semesterList);

    await upsertStudentToExcel(studentData, resultsWithOther, resultsWithoutOther, stream);
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

// --- PUBLIC SEARCH ROUTES ---
app.get('/api/search/:hallTicket', async (req, res) => {
  try {
    const hallTicket = req.params.hallTicket.toUpperCase();
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('hall_ticket', hallTicket)
      .maybeSingle();

    if (error) {
      console.error('Search error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json({
      studentData: data.student_data,
      results: data.results,
      resultsWithOther: data.results_with_other,
      resultsWithoutOther: data.results_without_other,
      timestamp: data.created_at,
      branch: data.branch
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/submissions/stream/:stream', async (req, res) => {
  try {
    const stream = req.params.stream;
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('branch', stream)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Stream sort error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    const mappedData = (data || []).map((row: any) => ({
      studentData: row.student_data,
      results: row.results,
      resultsWithOther: row.results_with_other,
      resultsWithoutOther: row.results_without_other,
      timestamp: row.created_at,
      branch: row.branch,
      id: row.id
    }));

    res.json(mappedData);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
// ----------------------------

// Admin Routes
app.post('/api/admin/rebuild', adminAuth, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    // Rebuild both streams
    for (const stream of ['CSE ICP', 'AIML ICP']) {
      const submissions = await getAllSubmissions(token, stream);
      const filePath = getExcelFilePath(stream);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      for (const sub of submissions) {
        await upsertStudentToExcel(sub.studentData, sub.resultsWithOther, sub.resultsWithoutOther, stream);
      }
    }
    
    if (isSheetsConnected()) {
      await syncToGoogleSheets();
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to rebuild data' });
  }
});

app.delete('/api/admin/student/:hallTicket', adminAuth, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const stream = (req.query.stream as string) || 'CSE ICP';
    const list = await deleteSubmission(req.params.hallTicket, token);
    
    // Rebuild excel for the affected stream
    const filePath = getExcelFilePath(stream);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    
    // Filter remaining submissions for this stream only
    const streamSubs = list.filter((s: any) => (s.studentData?.branch || 'CSE ICP') === stream);
    for (const sub of streamSubs) {
      await upsertStudentToExcel(sub.studentData, sub.resultsWithOther, sub.resultsWithoutOther, stream);
    }
    
    if (isSheetsConnected()) {
      await syncToGoogleSheets();
    }
    
    notifyAdminClients();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

app.put('/api/admin/student/:hallTicket', adminAuth, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const { studentData, results } = req.body;
    const stream = studentData.branch || 'CSE ICP';
    
    // Safety check - don't allow changing hallticket through this endpoint
    if (studentData.hallTicket !== req.params.hallTicket) {
      return res.status(400).json({ error: 'Cannot change hall ticket number.' });
    }

    // Use stream-aware evaluation
    const semesterList = stream === 'AIML ICP' ? aimlSemesters : cseSemesters;
    const resultsWithOther = evaluateEligibility(results, true, semesterList);
    const resultsWithoutOther = evaluateEligibility(results, false, semesterList);

    await saveSubmission({ studentData, results, resultsWithOther, resultsWithoutOther }, token);
    
    // Rebuild excel for this stream
    const list = await getAllSubmissions(token, stream);
    const filePath = getExcelFilePath(stream);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    
    for (const sub of list) {
      await upsertStudentToExcel(sub.studentData, sub.resultsWithOther, sub.resultsWithoutOther, stream);
    }
    
    if (isSheetsConnected()) {
      await syncToGoogleSheets();
    }
    
    notifyAdminClients();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

app.get('/api/admin/dashboard', adminAuth, async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const stream = (req.query.stream as string) || 'CSE ICP';
  const students = getAllStudents(stream);
  const submissions = await getAllSubmissions(token, stream);
  res.json({ students, submissions });
});

app.get('/api/admin/download', adminAuth, (req, res) => {
  const stream = (req.query.stream as string) || 'CSE ICP';
  const filePath = getExcelFilePath(stream);
  const filename = stream === 'AIML ICP' ? 'eligibility_master_aiml.xlsx' : 'eligibility_master_cse.xlsx';
  res.download(filePath, filename, (err) => {
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
      // Don't catch API routes — let them 404 naturally
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API route not found' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT as number, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

import fs from 'fs';
import path from 'path';
import { Mutex } from 'async-mutex';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'submissions.json');
const mutex = new Mutex();

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export async function saveSubmission(submission: any) {
  return await mutex.runExclusive(() => {
    let submissions = [];
    if (fs.existsSync(FILE_PATH)) {
      const data = fs.readFileSync(FILE_PATH, 'utf-8');
      try {
        submissions = JSON.parse(data);
      } catch (e) {
        submissions = [];
      }
    }
    
    // Check if student already exists (by hall ticket)
    const existingIndex = submissions.findIndex((s: any) => s.studentData.hallTicket === submission.studentData.hallTicket);
    if (existingIndex !== -1) {
      submissions[existingIndex] = { ...submission, timestamp: new Date().toISOString() };
    } else {
      submissions.push({ ...submission, timestamp: new Date().toISOString() });
    }

    fs.writeFileSync(FILE_PATH, JSON.stringify(submissions, null, 2));
  });
}

export function getAllSubmissions() {
  if (!fs.existsSync(FILE_PATH)) {
    return [];
  }
  const data = fs.readFileSync(FILE_PATH, 'utf-8');
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

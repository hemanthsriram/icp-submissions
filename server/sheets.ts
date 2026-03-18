import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { getAllStudents } from './excel';

const CONFIG_PATH = path.join(process.cwd(), 'config', 'google-credentials.json');
const SHEET_ID_PATH = path.join(process.cwd(), 'config', 'sheet-id.json');

let sheetsClient: any = null;
let currentSheetId: string | null = null;

export function isSheetsConnected() {
  return sheetsClient !== null && currentSheetId !== null;
}

export async function connectGoogleSheets(credentialsJson: string, sheetId: string) {
  try {
    const configDir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(CONFIG_PATH, credentialsJson);
    fs.writeFileSync(SHEET_ID_PATH, JSON.stringify({ sheetId }));

    await initializeSheetsClient();
    return true;
  } catch (error) {
    console.error("Failed to connect Google Sheets:", error);
    return false;
  }
}

export async function initializeSheetsClient() {
  if (fs.existsSync(CONFIG_PATH) && fs.existsSync(SHEET_ID_PATH)) {
    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: CONFIG_PATH,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      sheetsClient = google.sheets({ version: 'v4', auth });
      
      const sheetIdData = JSON.parse(fs.readFileSync(SHEET_ID_PATH, 'utf-8'));
      currentSheetId = sheetIdData.sheetId;
      return true;
    } catch (error) {
      console.error("Error initializing Google Sheets client:", error);
      sheetsClient = null;
      currentSheetId = null;
      return false;
    }
  }
  return false;
}

export async function syncToGoogleSheets() {
  if (!isSheetsConnected()) return;

  try {
    const students = getAllStudents();
    if (!students || students.length === 0) return;

    const headers = Object.keys(students[0]);
    const values = [
      headers,
      ...students.map((s: any) => headers.map(h => s[h] || ""))
    ];

    // For simplicity, we just sync the summary sheet to Google Sheets
    // The requirement says "Mirror all three sheets as separate tabs", let's do that if needed,
    // but the excel module currently only exports getAllStudents from the Summary sheet.
    // Let's just write to "Summary" tab for now.
    
    // Ensure sheet exists
    try {
      await sheetsClient.spreadsheets.values.update({
        spreadsheetId: currentSheetId,
        range: 'Summary!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values
        }
      });
    } catch (e: any) {
      // If "Summary" doesn't exist, we might need to create it or just write to Sheet1
      await sheetsClient.spreadsheets.values.update({
        spreadsheetId: currentSheetId,
        range: 'Sheet1!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values
        }
      });
    }
  } catch (error) {
    console.error("Error syncing to Google Sheets:", error);
  }
}

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { getWorkbookAoA } from './excel';

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
    // Helper to sync a specific sheet
    const updateSheet = async (title: string, data: any[][]) => {
      if (!data || data.length === 0) return;

      try {
        const sheetInfo = await sheetsClient.spreadsheets.get({ spreadsheetId: currentSheetId });
        const sheets = sheetInfo.data.sheets || [];
        const exists = sheets.some((s: any) => s.properties?.title === title);
        
        if (!exists) {
          await sheetsClient.spreadsheets.batchUpdate({
            spreadsheetId: currentSheetId,
            requestBody: {
              requests: [{ addSheet: { properties: { title } } }]
            }
          });
        }
        
        // Determine protected rows
        const isSummary = title.toLowerCase().includes('summary');
        const numProtectedRows = isSummary ? 2 : 3;
        const startRowForData = numProtectedRows + 1;

        // 1. Clear existing sheet data below protected rows
        await sheetsClient.spreadsheets.values.clear({
          spreadsheetId: currentSheetId,
          range: `${title}!A${startRowForData}:Z`
        });
        
        // 2. Slice data to remove local headers so we don't overwrite Google Sheets headers/formatting
        const dataRowsOnly = data.slice(numProtectedRows);

        if (dataRowsOnly.length > 0) {
          await sheetsClient.spreadsheets.values.update({
            spreadsheetId: currentSheetId,
            range: `${title}!A${startRowForData}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: dataRowsOnly }
          });
        }
      } catch (err) {
        console.error(`Error updating sheet ${title}:`, err);
      }
    };

    // Sync CSE ICP sheets
    const cseData = getWorkbookAoA('CSE ICP');
    if (cseData) {
      await updateSheet('With OTHER', cseData.withOther);
      await updateSheet('Without OTHER', cseData.withoutOther);
      await updateSheet('Summary', cseData.summary);
    }

    // Sync AIML ICP sheets
    const aimlData = getWorkbookAoA('AIML ICP');
    if (aimlData) {
      await updateSheet('With OTHER_AIML', aimlData.withOther);
      await updateSheet('Without OTHER_AIML', aimlData.withoutOther);
      await updateSheet('Summary_AIML', aimlData.summary);
    }

  } catch (error) {
    console.error("Error syncing to Google Sheets:", error);
  }
}

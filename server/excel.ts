import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { Mutex } from 'async-mutex';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'eligibility_master.xlsx');
const mutex = new Mutex();

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export async function upsertStudentToExcel(studentData: any, resultsWithOther: any, resultsWithoutOther: any) {
  return await mutex.runExclusive(() => {
    let wb: XLSX.WorkBook;
    
    if (fs.existsSync(FILE_PATH)) {
      wb = XLSX.readFile(FILE_PATH);
    } else {
      wb = createInitialWorkbook();
    }

    upsertRowToSheet(wb.Sheets["With OTHER"], studentData, resultsWithOther, true);
    upsertRowToSheet(wb.Sheets["Without OTHER"], studentData, resultsWithoutOther, false);
    upsertSummaryRow(wb.Sheets["Summary"], studentData, resultsWithOther, resultsWithoutOther);

    XLSX.writeFile(wb, FILE_PATH);
    return wb;
  });
}

function createInitialWorkbook() {
  const wb = XLSX.utils.book_new();
  
  const ws1 = createBaseSheet();
  XLSX.utils.book_append_sheet(wb, ws1, "With OTHER");

  const ws2 = createBaseSheet();
  XLSX.utils.book_append_sheet(wb, ws2, "Without OTHER");

  const ws3 = createBaseSummarySheet();
  XLSX.utils.book_append_sheet(wb, ws3, "Summary");

  return wb;
}

function createBaseSheet() {
  const ws = XLSX.utils.aoa_to_sheet([]);

  XLSX.utils.sheet_add_aoa(ws, [["ICP 2026 BATCH STUDENTS upto 3-1"]], { origin: "A1" });

  const row2 = [
    "Sl.No", "Hall Ticket Number", "Name of the Students", "Number of Credits",
    "Criteria - 1", "Criteria - 2", "Criteria - 3", "Criteria - 4",
    "Satisfactory(YES/NO)", "", "", "",
    "No. of Backlogs", "", "Backlog Subjects", ""
  ];
  XLSX.utils.sheet_add_aoa(ws, [row2], { origin: "A2" });

  const row3 = [
    "", "", "", "",
    "No. of Credits Scored up to III B.Tech I Sem. 80 CREDITS",
    "Completed minimum credits of 60 BTH credits within core field. 40 JNTUK Credits",
    "Completed minimum credits of 15 BTH credits within mathematics 10 JNTUK Credits",
    "Cleared all Mandatory Courses up to III B. Tech I Sem.",
    "Criteria - 1", "Criteria - 2", "Criteria - 3", "Criteria - 4",
    "Mandatory", "Total Backlogs up to 3-1", "", "Fee paid or not upto 3 year"
  ];
  XLSX.utils.sheet_add_aoa(ws, [row3], { origin: "A3" });

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 16 } }, // A1:Q1
    { s: { r: 1, c: 0 }, e: { r: 2, c: 0 } }, // A2:A3
    { s: { r: 1, c: 1 }, e: { r: 2, c: 1 } }, // B2:B3
    { s: { r: 1, c: 2 }, e: { r: 2, c: 2 } }, // C2:C3
    { s: { r: 1, c: 3 }, e: { r: 2, c: 3 } }, // D2:D3
    { s: { r: 1, c: 8 }, e: { r: 1, c: 11 } }, // I2:L2
    { s: { r: 1, c: 12 }, e: { r: 1, c: 13 } }, // M2:N2
    { s: { r: 1, c: 14 }, e: { r: 2, c: 14 } }, // O2:O3
  ];

  ws['!cols'] = [
    { wch: 5 }, { wch: 15 }, { wch: 25 }, { wch: 15 },
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
    { wch: 12 }, { wch: 15 }, { wch: 30 }, { wch: 15 }
  ];

  return ws;
}

function createBaseSummarySheet() {
  const ws = XLSX.utils.aoa_to_sheet([]);

  XLSX.utils.sheet_add_aoa(ws, [["Consolidated Eligibility Summary"]], { origin: "A1" });
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 14 } }];

  const headers = [
    "Sl.No", "Student Name", "Hall Ticket", "Total Credits",
    "Core Credits (with OTHER)", "Core Credits (without OTHER)", "Math Credits",
    "Total Backlogs", "Criteria 1", "Criteria 2 (with OTHER)", "Criteria 2 (without OTHER)",
    "Criteria 3", "Criteria 4"
  ];
  XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A2" });

  ws['!cols'] = headers.map(() => ({ wch: 18 }));

  return ws;
}

function findStudentRowIndex(ws: XLSX.WorkSheet, hallTicket: string, startRow: number, hallTicketColIndex: number = 1): number {
  const range = XLSX.utils.decode_range(ws['!ref'] || "A1:A1");
  for (let R = startRow; R <= range.e.r; ++R) {
    const cell = ws[XLSX.utils.encode_cell({ r: R, c: hallTicketColIndex })];
    if (cell && cell.v === hallTicket) {
      return R;
    }
  }
  return -1;
}

function getNextSlNo(ws: XLSX.WorkSheet, startRow: number): number {
  const range = XLSX.utils.decode_range(ws['!ref'] || "A1:A1");
  let maxSlNo = 0;
  for (let R = startRow; R <= range.e.r; ++R) {
    const cell = ws[XLSX.utils.encode_cell({ r: R, c: 0 })]; // Column A is index 0
    if (cell && typeof cell.v === 'number' && cell.v > maxSlNo) {
      maxSlNo = cell.v;
    }
  }
  return maxSlNo + 1;
}

function removeFooters(ws: XLSX.WorkSheet, startRow: number) {
  const range = XLSX.utils.decode_range(ws['!ref'] || "A1:A1");
  let footerStartR = -1;
  for (let R = startRow; R <= range.e.r; ++R) {
    const cell = ws[XLSX.utils.encode_cell({ r: R, c: 1 })];
    if (cell && typeof cell.v === 'string' && cell.v.startsWith("Note: Criteria 1:")) {
      footerStartR = R;
      break;
    }
  }

  if (footerStartR !== -1) {
    // Remove merges related to footers
    if (ws['!merges']) {
      ws['!merges'] = ws['!merges'].filter(m => m.s.r < footerStartR - 1);
    }
    
    // Delete footer cells
    for (let R = footerStartR - 1; R <= range.e.r; ++R) {
      for (let C = 0; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        delete ws[cellAddress];
      }
    }

    // Update range
    range.e.r = footerStartR - 2; // -2 because of the blank row before footer
    if (range.e.r < startRow - 1) range.e.r = startRow - 1;
    ws['!ref'] = XLSX.utils.encode_range(range);
  }
}

function appendFooters(ws: XLSX.WorkSheet) {
  const range = XLSX.utils.decode_range(ws['!ref'] || "A1:A1");
  const footerStart = range.e.r + 2; // Leave one blank row

  const footers = [
    ["", "Note: Criteria 1: Completed 120 BTH credits during first three years of education: R23/R19/R20: 80 JNTUK Credits"],
    ["", "Note: Criteria 2: Completed a minimum credits of 60 BTH credits within core field: R23/R19/R20: 40 JNTUK Credits"],
    ["", "Note: Criteria 3: Completed a minimum credits of 15 BTH credits within mathematics: R23/R19/R20: 10 JNTUK Credits"],
    ["", "Note: Criteria 4: Completed the Mandatory courses"]
  ];
  XLSX.utils.sheet_add_aoa(ws, footers, { origin: `A${footerStart + 1}` });

  if (!ws['!merges']) ws['!merges'] = [];
  for (let i = 0; i < 4; i++) {
    ws['!merges'].push({ s: { r: footerStart + i, c: 1 }, e: { r: footerStart + i, c: 16 } });
  }
  
  const newRange = XLSX.utils.decode_range(ws['!ref'] || "A1:A1");
  newRange.e.r = Math.max(newRange.e.r, footerStart + 3);
  ws['!ref'] = XLSX.utils.encode_range(newRange);
}

function upsertRowToSheet(ws: XLSX.WorkSheet, student: any, results: any, includeOther: boolean) {
  const startRow = 3; // 0-indexed, so row 4 is index 3
  removeFooters(ws, startRow);

  let rowIndex = findStudentRowIndex(ws, student.hallTicket, startRow);
  let slNo = 0;

  if (rowIndex === -1) {
    // Append new row
    const range = XLSX.utils.decode_range(ws['!ref'] || "A1:A1");
    rowIndex = Math.max(startRow, range.e.r + 1);
    slNo = getNextSlNo(ws, startRow);
  } else {
    // Update existing row
    const slNoCell = ws[XLSX.utils.encode_cell({ r: rowIndex, c: 0 })];
    slNo = slNoCell ? slNoCell.v : getNextSlNo(ws, startRow);
  }

  const dataRow = [
    slNo,
    student.hallTicket,
    student.name,
    results.totalCredits,
    results.totalCredits,
    results.coreCredits,
    results.mathCredits,
    results.mandatoryPassed ? "Yes" : "No",
    results.crit1 ? "YES" : "NO",
    results.crit2 ? "YES" : "NO",
    results.crit3 ? "YES" : "NO",
    results.crit4 ? "YES" : "NO",
    results.mandatoryBacklogs,
    results.totalBacklogs,
    results.backlogSubjects.join(", "),
    ""
  ];

  XLSX.utils.sheet_add_aoa(ws, [dataRow], { origin: `A${rowIndex + 1}` });
  appendFooters(ws);
}

function upsertSummaryRow(ws: XLSX.WorkSheet, student: any, resWith: any, resWithout: any) {
  const startRow = 2; // 0-indexed, row 3 is index 2
  
  let rowIndex = findStudentRowIndex(ws, student.hallTicket, startRow, 2); // Column C is index 2
  let slNo = 0;

  if (rowIndex === -1) {
    const range = XLSX.utils.decode_range(ws['!ref'] || "A1:A1");
    rowIndex = Math.max(startRow, range.e.r + 1);
    slNo = getNextSlNo(ws, startRow);
  } else {
    const slNoCell = ws[XLSX.utils.encode_cell({ r: rowIndex, c: 0 })];
    slNo = slNoCell ? slNoCell.v : getNextSlNo(ws, startRow);
  }

  const dataRow = [
    slNo,
    student.name,
    student.hallTicket,
    resWith.totalCredits,
    resWith.coreCredits,
    resWithout.coreCredits,
    resWith.mathCredits,
    resWith.totalBacklogs,
    resWith.crit1 ? "YES" : "NO",
    resWith.crit2 ? "YES" : "NO",
    resWithout.crit2 ? "YES" : "NO",
    resWith.crit3 ? "YES" : "NO",
    resWith.crit4 ? "YES" : "NO"
  ];

  XLSX.utils.sheet_add_aoa(ws, [dataRow], { origin: `A${rowIndex + 1}` });
}

export function getAllStudents() {
  if (!fs.existsSync(FILE_PATH)) {
    return [];
  }
  const wb = XLSX.readFile(FILE_PATH);
  const ws = wb.Sheets["Summary"];
  if (!ws) return [];
  
  const json = XLSX.utils.sheet_to_json(ws, { range: 1 }); // Skip title row
  return json;
}

export function getExcelFilePath() {
  return FILE_PATH;
}

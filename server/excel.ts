import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { Mutex } from 'async-mutex';
import { semesters as cseSemesters, Semester } from '../src/data/subjects';
import { aimlSemesters } from '../src/data/subjects-aiml';

const SUBJECT_SHORT_NAMES: Record<string, string> = {
  "Engineering Physics": "PHY",
  "Linear Algebra & Calculus": "M1",
  "Basic Electrical & Electronics Engineering": "BEEE",
  "Engineering Graphics": "EG",
  "Introduction to Programming": "C",
  "IT Workshop": "IT",
  "Engineering Physics Lab": "PHY LAB",
  "Electrical & Electronics Engineering Workshop": "EEE LAB",
  "Computer Programming Lab": "C LAB",
  "NSS/NCC/Scouts & Guides/Community Service": "NSS",
  "Communicative English": "ENG",
  "Chemistry": "CHEM",
  "Differential Equations & Vector Calculus": "M2",
  "Basic Civil & Mechanical Engineering": "BCME",
  "Data Structures": "DS",
  "Communicative English Lab": "ENG LAB",
  "Chemistry Lab": "CHEM LAB",
  "Engineering Workshop": "WORKSHOP",
  "Data Structures Lab": "DS LAB",
  "Health and wellness, Yoga and Sports": "YOGA & SPORTS",
  "Discrete Mathematics & Graph Theory": "M3",
  "Managerial Economics and Financial Analysis": "MEFA",
  "Computer Organization & Architecture": "COA",
  "Advanced Data Structures": "ADS",
  "Object Oriented Programming Through Java": "OOPJ",
  "Advanced Data Structures Lab": "ADS LAB",
  "Object Oriented Programming Through Java Lab": "OOPJ LAB",
  "Python Programming": "PYTHON",
  "Environmental Science": "ES",
  "Universal Human Values": "UHV",
  "Probability & Statistics": "M4",
  "Operating Systems": "OS",
  "Database Management Systems": "DBMS",
  "Software Engineering": "SE",
  "Operating Systems Lab": "OS LAB",
  "Database Management Systems Lab": "DBMS LAB",
  "Full Stack Development - I": "FSD I",
  "Design Thinking & Innovation": "DTI",
  "Data Warehousing and Data Mining": "DWDM",
  "Computer Networks": "CN",
  "Formal Languages and Automata Theory": "FLAT",
  "Design and Analysis of Algorithms": "DAA",
  "Open Elective-I": "OE I",
  "Data Mining Lab": "DM LAB",
  "Computer Networks Lab": "CN LAB",
  "Full Stack Development - II": "FSD II",
  "UI Design using Flutter": "UIDF",
  "Evaluation of Community Service Internship": "Community service",
  // AIML ICP specific short names
  "Universal Human Values – Understanding Harmony": "UHV",
  "Artificial Intelligence": "AI",
  "Optimization Techniques": "OT",
  "Machine Learning": "ML",
  "Machine Learning Lab": "ML LAB",
  "Full Stack Development-1": "FSD I",
  "Information Retrieval Systems": "IRS",
  "Automata Theory & Compiler Design": "ATCD",
  "Information Retrieval Lab": "IRS LAB",
  "Full Stack Development-2": "FSD II",
  "User Interface Design using Flutter": "UIDF",
  "Community Service Project Internship": "Community service"
};

function formatBacklog(subjectName: string, semesterList: Semester[]): string {
  const shortName = SUBJECT_SHORT_NAMES[subjectName] || subjectName;
  let isMandatory = false;
  for (const sem of semesterList) {
    const sub = sem.subjects.find(s => s.name === subjectName);
    if (sub && sub.isMandatory) {
      isMandatory = true;
      break;
    }
  }
  return isMandatory ? `${shortName}(M)` : shortName;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const mutex = new Mutex();

function getFilePath(stream: string = 'CSE ICP') {
  const suffix = stream === 'AIML ICP' ? 'aiml' : 'cse';
  return path.join(DATA_DIR, `eligibility_master_${suffix}.xlsx`);
}

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export async function upsertStudentToExcel(studentData: any, resultsWithOther: any, resultsWithoutOther: any, stream: string = 'CSE ICP') {
  return await mutex.runExclusive(() => {
    const filePath = getFilePath(stream);
    const semesterList = stream === 'AIML ICP' ? aimlSemesters : cseSemesters;
    let wb: XLSX.WorkBook;
    
    if (fs.existsSync(filePath)) {
      wb = XLSX.readFile(filePath);
    } else {
      wb = createInitialWorkbook();
    }

    upsertRowToSheet(wb.Sheets["With OTHER"], studentData, resultsWithOther, true, semesterList);
    upsertRowToSheet(wb.Sheets["Without OTHER"], studentData, resultsWithoutOther, false, semesterList);
    upsertSummaryRow(wb.Sheets["Summary"], studentData, resultsWithOther, resultsWithoutOther);

    XLSX.writeFile(wb, filePath);
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



function upsertRowToSheet(ws: XLSX.WorkSheet, student: any, results: any, includeOther: boolean, semesterList: Semester[] = cseSemesters) {
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
    results.crit1 ? "CLEARED" : "NOT CLEARED",
    results.crit2 ? "CLEARED" : "NOT CLEARED",
    results.crit3 ? "CLEARED" : "NOT CLEARED",
    results.crit4 ? "CLEARED" : "NOT CLEARED",
    results.crit1 ? "YES" : "NO",
    results.crit2 ? "YES" : "NO",
    results.crit3 ? "YES" : "NO",
    results.crit4 ? "YES" : "NO",
    results.mandatoryBacklogs,
    results.totalBacklogs,
    results.backlogSubjects.map((s: string) => formatBacklog(s, semesterList)).join(", "),
    ""
  ];

  XLSX.utils.sheet_add_aoa(ws, [dataRow], { origin: `A${rowIndex + 1}` });
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

export function getAllStudents(stream: string = 'CSE ICP') {
  const filePath = getFilePath(stream);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets["Summary"];
  if (!ws) return [];
  
  const json = XLSX.utils.sheet_to_json(ws, { range: 1 }); // Skip title row
  return json;
}

export function getWorkbookAoA(stream: string = 'CSE ICP') {
  const filePath = getFilePath(stream);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const wb = XLSX.readFile(filePath);
  
  const getSheetData = (sheetName: string) => {
    const ws = wb.Sheets[sheetName];
    if (!ws) return [];
    return XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
  };

  return {
    withOther: getSheetData("With OTHER"),
    withoutOther: getSheetData("Without OTHER"),
    summary: getSheetData("Summary")
  };
}

export function getExcelFilePath(stream: string = 'CSE ICP') {
  return getFilePath(stream);
}

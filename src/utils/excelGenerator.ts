import * as XLSX from 'xlsx';

export const generateExcel = (studentData: any, resultsWithOther: any, resultsWithoutOther: any) => {
  const wb = XLSX.utils.book_new();

  const ws1 = createSheet(studentData, resultsWithOther, true);
  XLSX.utils.book_append_sheet(wb, ws1, "With OTHER");

  const ws2 = createSheet(studentData, resultsWithoutOther, false);
  XLSX.utils.book_append_sheet(wb, ws2, "Without OTHER");

  const ws3 = createSummarySheet(studentData, resultsWithOther, resultsWithoutOther);
  XLSX.utils.book_append_sheet(wb, ws3, "Summary");

  XLSX.writeFile(wb, `${studentData.hallTicket}_Eligibility.xlsx`);
};

function createSheet(student: any, results: any, includeOther: boolean) {
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

  const dataRow = [
    1,
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
  XLSX.utils.sheet_add_aoa(ws, [dataRow], { origin: "A4" });

  const footerStart = 6; // Leave row 5 blank
  const footers = [
    ["", "Note: Criteria 1: Completed 120 BTH credits during first three years of education: R23/R19/R20: 80 JNTUK Credits"],
    ["", "Note: Criteria 2: Completed a minimum credits of 60 BTH credits within core field: R23/R19/R20: 40 JNTUK Credits"],
    ["", "Note: Criteria 3: Completed a minimum credits of 15 BTH credits within mathematics: R23/R19/R20: 10 JNTUK Credits"],
    ["", "Note: Criteria 4: Completed the Mandatory courses"]
  ];
  XLSX.utils.sheet_add_aoa(ws, footers, { origin: `A${footerStart}` });

  for (let i = 0; i < 4; i++) {
    ws['!merges'].push({ s: { r: footerStart - 1 + i, c: 1 }, e: { r: footerStart - 1 + i, c: 16 } });
  }

  ws['!cols'] = [
    { wch: 5 }, { wch: 15 }, { wch: 25 }, { wch: 15 },
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
    { wch: 12 }, { wch: 15 }, { wch: 30 }, { wch: 15 }
  ];

  return ws;
}

function createSummarySheet(student: any, resWith: any, resWithout: any) {
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

  const dataRow = [
    1,
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
  XLSX.utils.sheet_add_aoa(ws, [dataRow], { origin: "A3" });

  ws['!cols'] = headers.map(() => ({ wch: 18 }));

  return ws;
}

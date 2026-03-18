import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const FILE_PATH = path.join(process.cwd(), 'data', 'eligibility_master.xlsx');
if (fs.existsSync(FILE_PATH)) {
  const wb = XLSX.readFile(FILE_PATH);
  const ws = wb.Sheets["Summary"];
  if (ws) {
    const json = XLSX.utils.sheet_to_json(ws, { range: 1 });
    console.log(JSON.stringify(json, null, 2));
  } else {
    console.log("No Summary sheet");
  }
} else {
  console.log("File not found");
}

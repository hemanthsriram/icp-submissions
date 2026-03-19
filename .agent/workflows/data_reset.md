---
description: How to safely reset data in the ICP system and Google Sheets
---

# Safe Data Reset Workflow

When clearing test data or resetting the system for a new batch of students, it is **critical** to use the API-based deletion method and respect the Google Sheets templates.

You should NEVER use `sheetsClient.spreadsheets.values.clear({ range: title })` or wipe the entire sheet, as this destroys the formatted templates and headers required by the admin team.

## 1. System Data Reset (Supabase & Local Files)
Always use the authenticated API to delete students to ensure Row Level Security (RLS) is properly bypassed and the Supabase triggers fire correctly. Do not attempt direct anonymous Supabase deletes.

Example deletion logic:
```javascript
// 1. Authenticate to get Admin JWT
const loginRes = await fetch('http://localhost:3000/api/admin/login', {
  method: 'POST',
  body: JSON.stringify({ username: 'Hemanth', password: 'adminpassword' })
});
const { token } = await loginRes.json();

// 2. Fetch submissions for the stream
const res = await fetch(`http://localhost:3000/api/admin/dashboard?stream=CSE ICP`, {
  headers: { Authorization: `Bearer ${token}` }
});
const { submissions } = await res.json();

// 3. Delete individually
for (const sub of submissions) {
  await fetch(`http://localhost:3000/api/admin/student/${sub.studentData.hallTicket}?stream=CSE ICP`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
}

// 4. Wipe local Excel files corresponding to the stream
// fs.unlinkSync('./data/eligibility_master_cse.xlsx');
```

## 2. Safe Google Sheets Reset (Row-Restricted Clearing)
When resetting Google Sheets directly via the API, strictly preserve the template structure:

- **With OTHER** / **Without OTHER** / **With OTHER_AIML** / **Without OTHER_AIML**:
  - ❗️ **Do NOT modify/delete the first 3 rows** (Headers, sub-headers, formatting)
  - ✅ Clear from Row 4 onwards (`range: 'With OTHER'!A4:Z`)

- **Summary** / **Summary_AIML**:
  - ❗️ **Do NOT modify/delete the first 2 rows**
  - ✅ Clear from Row 3 onwards (`range: 'Summary'!A3:Z`)

This row-restricted logic is already implemented in `server/sheets.ts` for automatic syncs (`updateSheet` function), but if you are writing a manual reset script, you must enforce these ranges.

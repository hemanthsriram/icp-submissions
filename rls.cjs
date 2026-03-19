const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:admin@ICP909@db.sicskfxvjrjvdmtbqjkh.supabase.co:5432/postgres'
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to DB for RLS.');
    
    await client.query(`
      -- Enable RLS
      ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

      -- Drop existing policies if they exist (for idempotence)
      DROP POLICY IF EXISTS "CSE Admin Policy" ON submissions;
      DROP POLICY IF EXISTS "AIML Admin Policy" ON submissions;
      DROP POLICY IF EXISTS "Public Insert Policy" ON submissions;
      DROP POLICY IF EXISTS "Public Select Policy" ON submissions;
      DROP POLICY IF EXISTS "Admin Read All Policy" ON submissions;
      DROP POLICY IF EXISTS "CSE Admin Mutation Policy" ON submissions;
      DROP POLICY IF EXISTS "AIML Admin Mutation Policy" ON submissions;

      -- Students can always insert their own records (anonymous or authenticated)
      CREATE POLICY "Public Insert Policy" ON submissions
        FOR INSERT 
        WITH CHECK (true);

      -- Both admins can READ all submissions (dashboard toggle needs this)
      CREATE POLICY "Admin Read All Policy" ON submissions
        FOR SELECT
        USING (
          auth.jwt() ->> 'email' IN ('hemanth@admin.cse', 'viswa@admin.aiml')
        );

      -- CSE Admin can update/delete ONLY CSE records
      CREATE POLICY "CSE Admin Mutation Policy" ON submissions
        FOR ALL
        USING (auth.jwt() ->> 'email' = 'hemanth@admin.cse' AND branch = 'CSE ICP');

      -- AIML Admin can update/delete ONLY AIML records
      CREATE POLICY "AIML Admin Mutation Policy" ON submissions
        FOR ALL
        USING (auth.jwt() ->> 'email' = 'viswa@admin.aiml' AND branch = 'AIML ICP');
    `);
    
    console.log('[OK] Applied Row Level Security!');
    process.exit(0);
  } catch (err) {
    console.error('Critical Error:', err);
    process.exit(1);
  }
}
run();

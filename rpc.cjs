const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:admin@ICP909@db.sicskfxvjrjvdmtbqjkh.supabase.co:5432/postgres'
});

async function run() {
  try {
    await client.connect();
    await client.query(`
      CREATE OR REPLACE FUNCTION upsert_submission(
        p_hall_ticket varchar,
        p_branch varchar,
        p_student_data jsonb,
        p_results jsonb,
        p_results_with_other jsonb,
        p_results_without_other jsonb
      )
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        INSERT INTO submissions (hall_ticket, branch, student_data, results, results_with_other, results_without_other)
        VALUES (p_hall_ticket, p_branch, p_student_data, p_results, p_results_with_other, p_results_without_other)
        ON CONFLICT (hall_ticket) 
        DO UPDATE SET 
          branch = EXCLUDED.branch,
          student_data = EXCLUDED.student_data,
          results = EXCLUDED.results,
          results_with_other = EXCLUDED.results_with_other,
          results_without_other = EXCLUDED.results_without_other;
      END;
      $$;
    `);
    console.log("RPC created successfully.");
    process.exit(0);
  } catch (err) {
    console.error("RPC Error:", err);
    process.exit(1);
  }
}
run();

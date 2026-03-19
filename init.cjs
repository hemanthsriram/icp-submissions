const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:admin@ICP909@db.sicskfxvjrjvdmtbqjkh.supabase.co:5432/postgres'
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to DB securely.');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        hall_ticket varchar primary key,
        branch varchar not null,
        student_data jsonb not null,
        results jsonb not null,
        results_with_other jsonb not null,
        results_without_other jsonb not null,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null
      );
    `);
    console.log('[OK] Created tables.');

    // Attempting raw auth insertion
    const checkHeManth = await client.query(`SELECT id FROM auth.users WHERE email = 'hemanth@admin.cse'`);
    if (checkHeManth.rows.length === 0) {
      await client.query(`
        INSERT INTO auth.users (
          instance_id, id, aud, role, email, 
          encrypted_password, email_confirmed_at, 
          created_at, updated_at, confirmation_token, 
          recovery_token, email_change_token_new, email_change
        )
        VALUES (
          '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'hemanth@admin.cse', 
          crypt('admincse', gen_salt('bf')), now(), 
          now(), now(), '', '', '', ''
        );
      `);
      console.log('[OK] Hemanth user seeded.');
    } else {
      console.log('[SKIP] Hemanth user exists.');
    }

    const checkViswa = await client.query(`SELECT id FROM auth.users WHERE email = 'viswa@admin.aiml'`);
    if (checkViswa.rows.length === 0) {
      await client.query(`
        INSERT INTO auth.users (
          instance_id, id, aud, role, email, 
          encrypted_password, email_confirmed_at, 
          created_at, updated_at, confirmation_token, 
          recovery_token, email_change_token_new, email_change
        )
        VALUES (
          '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'viswa@admin.aiml', 
          crypt('aimladmin', gen_salt('bf')), now(), 
          now(), now(), '', '', '', ''
        );
      `);
      console.log('[OK] Viswa user seeded.');
    } else {
      console.log('[SKIP] Viswa user exists.');
    }

    // Try linking identities just in case Supabase API requires it
    await client.query(`
      INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      SELECT gen_random_uuid(), id, id::text, format('{"sub":"%s","email":"%s"}', id, email)::jsonb, 'email', now(), now(), now()
      FROM auth.users 
      WHERE email IN ('hemanth@admin.cse', 'viswa@admin.aiml')
      ON CONFLICT DO NOTHING;
    `);

    console.log('Setup sequence fully completed.');
    process.exit(0);
  } catch (err) {
    console.error('Critical Error:', err);
    process.exit(1);
  }
}
run();

import { createClient } from '@supabase/supabase-js';
import { supabase as fallbackSupabase, supabaseUrl, supabaseKey } from './supabase';

export function getScopedClient(token?: string) {
  if (!token) return fallbackSupabase;
  return createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
}

export async function saveSubmission(submission: any, token?: string) {
  const client = getScopedClient(token);
  const { studentData, results, resultsWithOther, resultsWithoutOther } = submission;
  
  const { error } = await client.rpc('upsert_submission', {
    p_hall_ticket: studentData.hallTicket,
    p_branch: studentData.branch || 'CSE ICP',
    p_student_data: studentData,
    p_results: results,
    p_results_with_other: resultsWithOther,
    p_results_without_other: resultsWithoutOther
  });
    
  if (error) {
    console.error("Supabase Save Error:", error);
    throw error;
  }
  return true;
}

export async function getAllSubmissions(token?: string, branch?: string) {
  const client = getScopedClient(token);
  let query = client
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (branch) {
    query = query.eq('branch', branch);
  }
  
  const { data, error } = await query;
    
  if (error || !data) {
    console.error("Supabase Fetch Error:", error);
    return [];
  }
  
  // Re-map it to match the existing frontend expectations naturally
  return data.map((row: any) => ({
    studentData: row.student_data,
    results: row.results,
    resultsWithOther: row.results_with_other,
    resultsWithoutOther: row.results_without_other,
    timestamp: row.created_at
  }));
}

export async function deleteSubmission(hallTicket: string, token?: string) {
  const client = getScopedClient(token);
  const { error, count } = await client
    .from('submissions')
    .delete({ count: 'exact' })
    .eq('hall_ticket', hallTicket);
    
  if (error) {
    console.error("Supabase Delete Error:", error);
    throw error;
  }
  
  if (count === 0) {
    throw new Error('Supabase Delete blocked by Row Level Security or Zero matches.');
  }
  
  return await getAllSubmissions(token); // Re-fetch remaining list automatically
}

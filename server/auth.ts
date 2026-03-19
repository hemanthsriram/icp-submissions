import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseKey } from './supabase';

export async function adminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token as string;

  let token = queryToken;
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    console.error('[Auth] No token provided');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Create a fresh client scoped to this user's token
    const scopedClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: { user }, error } = await scopedClient.auth.getUser();

    if (error || !user) {
      console.error('[Auth] Token verification failed:', error?.message || 'No user returned');
      return res.status(403).json({ error: 'Forbidden. Invalid Session.' });
    }

    (req as any).user = user;
    next();
  } catch (err) {
    console.error('[Auth] Unexpected error:', err);
    return res.status(500).json({ error: 'Auth verification error' });
  }
}

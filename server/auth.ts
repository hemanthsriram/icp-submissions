import { Request, Response, NextFunction } from 'express';

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token as string;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const isValidHeader = authHeader && authHeader === `Bearer ${adminPassword}`;
  const isValidQuery = queryToken && queryToken === adminPassword;

  if (!isValidHeader && !isValidQuery) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

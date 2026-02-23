import { Context, Next } from 'hono';
import { verifyToken, extractToken } from '../auth';
import type { Env } from '../types';

type Variables = {
  userId: string;
  username: string;
};

export async function authMiddleware(c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) {
  const token = extractToken(c.req.raw);

  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const payload = await verifyToken(token, c.env.JWT_SECRET);

  if (!payload) {
    return c.json({ error: 'Invalid token' }, 401);
  }

  c.set('userId', payload.userId);
  c.set('username', payload.username);

  await next();
}

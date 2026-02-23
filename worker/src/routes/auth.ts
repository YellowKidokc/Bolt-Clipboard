import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema';
import { hashPassword, verifyPassword, createToken } from '../auth';
import type { Env } from '../types';

const auth = new Hono<{ Bindings: Env }>();

auth.post('/signup', async (c) => {
  const { username, password } = await c.req.json();

  if (!username || !password) {
    return c.json({ error: 'Username and password required' }, 400);
  }

  const db = drizzle(c.env.DB);

  const existing = await db.select().from(users).where(eq(users.username, username)).get();

  if (existing) {
    return c.json({ error: 'User already exists' }, 400);
  }

  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  await db.insert(users).values({
    id,
    username,
    passwordHash,
  });

  const token = await createToken(id, username, c.env.JWT_SECRET);

  return c.json({ token, user: { id, username } });
});

auth.post('/signin', async (c) => {
  const { username, password } = await c.req.json();

  if (!username || !password) {
    return c.json({ error: 'Username and password required' }, 400);
  }

  const db = drizzle(c.env.DB);

  const user = await db.select().from(users).where(eq(users.username, username)).get();

  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const valid = await verifyPassword(password, user.passwordHash);

  if (!valid) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const token = await createToken(user.id, user.username, c.env.JWT_SECRET);

  return c.json({ token, user: { id: user.id, username: user.username } });
});

export default auth;

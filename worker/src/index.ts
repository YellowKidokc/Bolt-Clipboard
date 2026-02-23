import { Hono } from 'hono';
import { cors } from 'hono/cors';
import authRouter from './routes/auth';
import jobsRouter from './routes/jobs';
import { handleQueueMessage } from './queue';
import type { Env, JobMessage } from './types';

const app = new Hono<{ Bindings: Env }>();

app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.route('/api/auth', authRouter);
app.route('/api/jobs', jobsRouter);

app.get('/', (c) => c.json({ message: 'Theophysics Universal Media Pipeline' }));

export default {
  fetch: app.fetch,
  async queue(batch: MessageBatch<JobMessage>, env: Env): Promise<void> {
    await handleQueueMessage(batch, env);
  },
};

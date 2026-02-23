import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import { jobs, artifacts } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import type { Env, JobMessage } from '../types';

const jobsRouter = new Hono<{ Bindings: Env; Variables: { userId: string } }>();

jobsRouter.use('/*', authMiddleware);

jobsRouter.post('/upload', async (c) => {
  const formData = await c.req.formData();
  const fileEntry = formData.get('file');
  const title = formData.get('title');
  const type = formData.get('type');

  if (!fileEntry || typeof fileEntry === 'string' || !title || !type) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  const file = fileEntry as File;

  const userId = c.get('userId');
  const jobId = crypto.randomUUID();
  const r2Key = `uploads/${userId}/${jobId}/${file.name}`;

  await c.env.R2_BUCKET.put(r2Key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  });

  const db = drizzle(c.env.DB);

  await db.insert(jobs).values({
    id: jobId,
    userId,
    title: title as string,
    type: type as string,
    status: 'queued',
    r2Key,
    metadata: JSON.stringify({
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    }),
  });

  const message: JobMessage = {
    jobId,
    type: type as JobMessage['type'],
    userId,
    r2Key,
  };

  await c.env.MEDIA_QUEUE.send(message);

  return c.json({ jobId, status: 'queued' });
});

jobsRouter.post('/url', async (c) => {
  const { url, title, type } = await c.req.json();

  if (!url || !title || !type) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  const userId = c.get('userId');
  const jobId = crypto.randomUUID();

  const db = drizzle(c.env.DB);

  await db.insert(jobs).values({
    id: jobId,
    userId,
    title,
    type,
    status: 'queued',
    sourceUrl: url,
  });

  const message: JobMessage = {
    jobId,
    type: type as JobMessage['type'],
    userId,
    sourceUrl: url,
  };

  await c.env.MEDIA_QUEUE.send(message);

  return c.json({ jobId, status: 'queued' });
});

jobsRouter.post('/bulk', async (c) => {
  const { urls, type } = await c.req.json();

  if (!urls || !Array.isArray(urls) || urls.length === 0 || !type) {
    return c.json({ error: 'Invalid request' }, 400);
  }

  const userId = c.get('userId');
  const db = drizzle(c.env.DB);
  const jobIds: string[] = [];

  for (const url of urls) {
    const jobId = crypto.randomUUID();

    await db.insert(jobs).values({
      id: jobId,
      userId,
      title: url,
      type,
      status: 'queued',
      sourceUrl: url,
    });

    const message: JobMessage = {
      jobId,
      type: type as JobMessage['type'],
      userId,
      sourceUrl: url,
    };

    await c.env.MEDIA_QUEUE.send(message);
    jobIds.push(jobId);
  }

  return c.json({ jobIds, count: jobIds.length, status: 'queued' });
});

jobsRouter.get('/', async (c) => {
  const userId = c.get('userId');
  const db = drizzle(c.env.DB);

  const allJobs = await db
    .select()
    .from(jobs)
    .where(eq(jobs.userId, userId))
    .orderBy(desc(jobs.createdAt))
    .all();

  return c.json({ jobs: allJobs });
});

jobsRouter.get('/:id', async (c) => {
  const jobId = c.req.param('id');
  const userId = c.get('userId');
  const db = drizzle(c.env.DB);

  const job = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .get();

  if (!job || job.userId !== userId) {
    return c.json({ error: 'Job not found' }, 404);
  }

  const jobArtifacts = await db
    .select()
    .from(artifacts)
    .where(eq(artifacts.jobId, jobId))
    .all();

  return c.json({ job, artifacts: jobArtifacts });
});

jobsRouter.delete('/:id', async (c) => {
  const jobId = c.req.param('id');
  const userId = c.get('userId');
  const db = drizzle(c.env.DB);

  const job = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .get();

  if (!job || job.userId !== userId) {
    return c.json({ error: 'Job not found' }, 404);
  }

  if (job.r2Key) {
    await c.env.R2_BUCKET.delete(job.r2Key);
  }

  await db.delete(jobs).where(eq(jobs.id, jobId));

  return c.json({ success: true });
});

export default jobsRouter;

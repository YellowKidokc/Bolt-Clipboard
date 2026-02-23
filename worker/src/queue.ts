import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { jobs, artifacts } from './db/schema';
import type { Env, JobMessage } from './types';

export async function handleQueueMessage(batch: MessageBatch<JobMessage>, env: Env): Promise<void> {
  const db = drizzle(env.DB);

  for (const message of batch.messages) {
    const { jobId, type, r2Key, sourceUrl } = message.body;

    try {
      await db
        .update(jobs)
        .set({ status: 'processing', startedAt: new Date() })
        .where(eq(jobs.id, jobId))
        .run();

      let fileData: ArrayBuffer | null = null;

      if (r2Key) {
        const object = await env.R2_BUCKET.get(r2Key);
        if (object) {
          fileData = await object.arrayBuffer();
        }
      } else if (sourceUrl) {
        const response = await fetch(sourceUrl);
        if (response.ok) {
          fileData = await response.arrayBuffer();
        }
      }

      if (!fileData) {
        throw new Error('Failed to retrieve file data');
      }

      if (type === 'video' || type === 'audio') {
        await db
          .update(jobs)
          .set({ status: 'transcribing' })
          .where(eq(jobs.id, jobId))
          .run();

        const transcriptKey = `transcripts/${jobId}.txt`;
        const transcript = await transcribeAudio(fileData, env);

        await env.R2_BUCKET.put(transcriptKey, transcript);

        await db.insert(artifacts).values({
          id: crypto.randomUUID(),
          jobId,
          type: 'transcript',
          r2Key: transcriptKey,
          mimeType: 'text/plain',
          sizeBytes: new Blob([transcript]).size,
        });

        await db
          .update(jobs)
          .set({ transcriptKey })
          .where(eq(jobs.id, jobId))
          .run();
      }

      await db
        .update(jobs)
        .set({ status: 'analyzing' })
        .where(eq(jobs.id, jobId))
        .run();

      const summaryKey = `summaries/${jobId}.txt`;
      const summary = await generateSummary(fileData, type, env);

      await env.R2_BUCKET.put(summaryKey, summary);

      await db.insert(artifacts).values({
        id: crypto.randomUUID(),
        jobId,
        type: 'summary',
        r2Key: summaryKey,
        mimeType: 'text/plain',
        sizeBytes: new Blob([summary]).size,
      });

      await db
        .update(jobs)
        .set({
          status: 'completed',
          summaryKey,
          completedAt: new Date(),
        })
        .where(eq(jobs.id, jobId))
        .run();

      message.ack();
    } catch (error) {
      await db
        .update(jobs)
        .set({
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date(),
        })
        .where(eq(jobs.id, jobId))
        .run();

      message.retry();
    }
  }
}

async function transcribeAudio(audioData: ArrayBuffer, env: Env): Promise<string> {
  if (env.OPENAI_API_KEY) {
    const formData = new FormData();
    formData.append('file', new Blob([audioData]), 'audio.mp3');
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: formData,
    });

    const result = await response.json() as { text: string };
    return result.text;
  }

  return '[Transcription placeholder - configure OPENAI_API_KEY or Workers AI]';
}

async function generateSummary(data: ArrayBuffer, type: string, env: Env): Promise<string> {
  if (env.ANTHROPIC_API_KEY) {
    const text = new TextDecoder().decode(data);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Summarize this ${type} content in 3-5 sentences:\n\n${text.slice(0, 10000)}`,
          },
        ],
      }),
    });

    const result = await response.json() as { content: Array<{ text: string }> };
    return result.content[0].text;
  }

  return '[Summary placeholder - configure ANTHROPIC_API_KEY]';
}

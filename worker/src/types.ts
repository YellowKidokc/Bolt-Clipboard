export interface Env {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  MEDIA_QUEUE: Queue;
  JWT_SECRET: string;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
}

export interface JWTPayload {
  userId: string;
  username: string;
  iat: number;
  exp: number;
}

export interface JobMessage {
  jobId: string;
  type: 'video' | 'audio' | 'document' | 'url' | 'bulk';
  userId: string;
  r2Key?: string;
  sourceUrl?: string;
  metadata?: Record<string, unknown>;
}

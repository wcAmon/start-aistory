import { pgSchema, uuid, text, boolean, timestamp, jsonb, doublePrecision } from 'drizzle-orm/pg-core'

// Custom schema for aistory tables
export const aistorySchema = pgSchema('aistory')

// Jobs table
export const jobs = aistorySchema.table('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id'),

  // Input
  idea: text('idea').notNull(),
  style: text('style').notNull().$type<'cinematic' | 'anime'>(),
  imageEngine: text('image_engine').$type<'openai' | 'nano-banana'>().default('nano-banana'),
  languageEngine: text('language_engine').$type<'gpt' | 'gemini'>().default('gemini'),
  testMode: boolean('test_mode').default(false),
  // Kept for backward compatibility with existing rows
  voice: text('voice').$type<'male' | 'female'>().default('male'),
  subtitlePosition: text('subtitle_position').$type<'top' | 'middle' | 'bottom'>().default('bottom'),

  // Status
  status: text('status').notNull().default('pending').$type<'pending' | 'queued' | 'processing' | 'cancelling' | 'completed' | 'failed' | 'cancelled'>(),
  currentStep: text('current_step'),
  errorMessage: text('error_message'),
  logs: jsonb('logs').default([]).$type<LogEntry[]>(),

  // Output
  videoUrl: text('video_url'),
  videoTitle: text('video_title'),
  videoDescription: text('video_description'),
  videoHashtags: jsonb('video_hashtags').$type<string[]>(),
  videoDuration: doublePrecision('video_duration'),
  generationTime: doublePrecision('generation_time'),
  videoMetadataExtended: jsonb('video_metadata_extended'),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
})

// Type exports
export type Job = typeof jobs.$inferSelect
export type NewJob = typeof jobs.$inferInsert

export interface LogEntry {
  timestamp: string
  step: string
  message: string
  level?: 'info' | 'progress' | 'success' | 'error'
  elapsed_seconds?: number
}

import { createClient } from '@supabase/supabase-js'
import { env } from '@/env'

// Client-side Supabase client
export const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_PUBLISHABLE_KEY,
  {
    db: { schema: 'aistory' },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
)

// Types for job status
export type JobStatus = 'pending' | 'queued' | 'processing' | 'cancelling' | 'completed' | 'failed' | 'cancelled'

export interface VideoMetadataExtended {
  title: string
  description: string
  hashtags: string[]
}

export interface Job {
  id: string
  owner_id: string | null
  idea: string
  style: 'cinematic' | 'anime'
  image_engine: 'openai' | 'nano-banana'
  language_engine: 'gpt' | 'gemini'
  test_mode: boolean
  // Kept for backward compatibility
  voice?: 'male' | 'female' | null
  subtitle_position?: 'top' | 'middle' | 'bottom' | null
  status: JobStatus
  current_step: string | null
  error_message: string | null
  logs: LogEntry[]
  video_url: string | null
  video_title: string | null
  video_description: string | null
  video_hashtags: string[] | null
  video_duration: number | null
  generation_time: number | null
  video_metadata_extended: VideoMetadataExtended | null
  created_at: string
  updated_at: string
  started_at: string | null
  completed_at: string | null
}

export interface LogEntry {
  timestamp: string
  step: string
  message: string
  level?: 'info' | 'progress' | 'success' | 'error'
  elapsed_seconds?: number
}

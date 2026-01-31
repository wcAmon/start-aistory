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

export interface TitleVariant {
  style: 'story' | 'clickbait' | 'question' | 'emotional'
  text: string
}

export interface VideoMetadataExtended {
  title: string
  title_variants: TitleVariant[]
  recommended_title_index: number
  description: {
    hook: string
    body: string
    call_to_action: string
  }
  full_description: string
  hashtags: {
    trending: string[]
    niche: string[]
    branded: string[]
  }
  all_hashtags: string[]
  thumbnail_text_suggestions: string[]
  virality_analysis: {
    estimated_score: number
    strengths: string[]
    hook_effectiveness: string
  }
}

export interface Job {
  id: string
  owner_id: string
  idea: string
  style: 'cinematic' | 'anime'
  voice: 'male' | 'female'
  subtitle_position: 'top' | 'middle' | 'bottom'
  test_mode: boolean
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

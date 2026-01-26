import { Store } from '@tanstack/store'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase, type Job, type LogEntry } from '@/lib/supabase'

export type AppState = 'idle' | 'queued' | 'generating' | 'complete' | 'error'

export interface JobState {
  // Current job being generated
  currentJobId: string | null
  currentJob: Job | null
  queuePosition: number | null

  // App state
  appState: AppState
  error: string | null
  isSubmitting: boolean

  // Realtime subscription
  subscription: RealtimeChannel | null
}

export const jobStore = new Store<JobState>({
  currentJobId: null,
  currentJob: null,
  queuePosition: null,
  appState: 'idle',
  error: null,
  isSubmitting: false,
  subscription: null,
})

// Subscribe to job updates via Supabase Realtime
export function subscribeToJob(jobId: string) {
  // Unsubscribe from previous subscription
  unsubscribeFromJob()

  const channel = supabase
    .channel(`job:${jobId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'aistory',
        table: 'jobs',
        filter: `id=eq.${jobId}`,
      },
      (payload) => {
        const job = payload.new as Job
        updateJobState(job)
      }
    )
    .subscribe()

  jobStore.setState((state) => ({
    ...state,
    currentJobId: jobId,
    subscription: channel,
  }))
}

// Unsubscribe from job updates
export function unsubscribeFromJob() {
  const state = jobStore.state
  if (state.subscription) {
    supabase.removeChannel(state.subscription)
    jobStore.setState((s) => ({ ...s, subscription: null }))
  }
}

// Update job state based on job data
function updateJobState(job: Job) {
  let appState: AppState = 'idle'

  switch (job.status) {
    case 'pending':
    case 'queued':
      appState = 'queued'
      break
    case 'processing':
      appState = 'generating'
      break
    case 'completed':
      appState = 'complete'
      break
    case 'failed':
    case 'cancelled':
      appState = 'error'
      break
  }

  jobStore.setState((state) => ({
    ...state,
    currentJob: job,
    appState,
    error: job.status === 'failed' ? job.error_message : null,
  }))
}

// Actions
export function setSubmitting(isSubmitting: boolean) {
  jobStore.setState((state) => ({ ...state, isSubmitting }))
}

export function setError(error: string | null) {
  jobStore.setState((state) => ({
    ...state,
    error,
    appState: error ? 'error' : state.appState,
  }))
}

export function setQueuePosition(position: number | null) {
  jobStore.setState((state) => ({ ...state, queuePosition: position }))
}

export function startNewJob(jobId: string, queuePosition: number) {
  jobStore.setState((state) => ({
    ...state,
    currentJobId: jobId,
    queuePosition,
    appState: 'queued',
    error: null,
  }))

  // Subscribe to job updates
  subscribeToJob(jobId)
}

export function resetJob() {
  unsubscribeFromJob()

  jobStore.setState(() => ({
    currentJobId: null,
    currentJob: null,
    queuePosition: null,
    appState: 'idle',
    error: null,
    isSubmitting: false,
    subscription: null,
  }))
}

// Resume tracking an existing job (e.g., from history click)
export function resumeJob(job: Job) {
  // Determine app state from job status
  let appState: AppState = 'idle'
  switch (job.status) {
    case 'pending':
    case 'queued':
      appState = 'queued'
      break
    case 'processing':
      appState = 'generating'
      break
    case 'completed':
      appState = 'complete'
      break
    case 'failed':
    case 'cancelled':
      appState = 'error'
      break
  }

  // Update state with job data
  jobStore.setState((state) => ({
    ...state,
    currentJobId: job.id,
    currentJob: job,
    queuePosition: null,
    appState,
    error: job.status === 'failed' ? job.error_message : null,
  }))

  // Subscribe to realtime updates if job is still active
  if (job.status === 'pending' || job.status === 'queued' || job.status === 'processing') {
    subscribeToJob(job.id)
  }
}

// Selectors
export function getCurrentLogs(): LogEntry[] {
  return jobStore.state.currentJob?.logs ?? []
}

export function getCurrentStep(): string {
  return jobStore.state.currentJob?.current_step ?? ''
}

export function getCompletionData() {
  const job = jobStore.state.currentJob
  if (!job || job.status !== 'completed') return null

  return {
    videoUrl: job.video_url ?? '',
    suggestedTitle: job.video_title ?? '',
    suggestedDescription: job.video_description ?? '',
    suggestedHashtags: job.video_hashtags ?? [],
  }
}

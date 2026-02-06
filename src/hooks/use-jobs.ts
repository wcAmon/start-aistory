import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { startNewJob, setSubmitting, setError } from '@/stores'
import type { Job } from '@/lib/supabase'

export interface CreateJobRequest {
  idea: string
  style: 'cinematic' | 'anime'
  image_engine: 'openai' | 'nano-banana'
  language_engine: 'gpt' | 'gemini'
  test_mode?: boolean
}

export interface CreateJobResponse {
  job_id: string
  status: string
  queue_position: number
}

// Fetch jobs list
async function fetchJobs(): Promise<Job[]> {
  const response = await fetch('/api/jobs')

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to fetch jobs')
  }

  const data = await response.json()
  return data.jobs
}

// Create a new job
async function createJob(request: CreateJobRequest): Promise<CreateJobResponse> {
  const response = await fetch('/api/jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || error.detail || 'Failed to create job')
  }

  return response.json()
}

// Fetch single job
async function fetchJob(jobId: string): Promise<Job> {
  const response = await fetch(`/api/jobs/${jobId}`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to fetch job')
  }

  return response.json()
}

// Delete a job
async function deleteJob(jobId: string): Promise<void> {
  const response = await fetch(`/api/jobs/${jobId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to delete job')
  }
}

// Cancel a job (returns status info)
export interface CancelJobResponse {
  success: boolean
  message: string
  status?: string
}

async function cancelJob(jobId: string): Promise<CancelJobResponse> {
  const response = await fetch(`/api/jobs/${jobId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to cancel job')
  }

  return response.json()
}

// Export fetchJob for use in polling
export { fetchJob }

// Hook: List all jobs
export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: () => fetchJobs(),
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Hook: Get single job
export function useJob(jobId: string | null) {
  return useQuery({
    queryKey: ['jobs', jobId],
    queryFn: () => {
      if (!jobId) throw new Error('No job ID')
      return fetchJob(jobId)
    },
    enabled: !!jobId,
  })
}

// Hook: Create a new job
export function useCreateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: CreateJobRequest) => {
      setSubmitting(true)
      setError(null)

      try {
        const result = await createJob(request)
        return result
      } finally {
        setSubmitting(false)
      }
    },
    onSuccess: (data) => {
      // Start tracking the new job
      startNewJob(data.job_id, data.queue_position)

      // Invalidate jobs list
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
    onError: (error: Error) => {
      setError(error.message)
    },
  })
}

// Hook: Delete a job
export function useDeleteJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (jobId: string) => {
      await deleteJob(jobId)
      return jobId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

// Hook: Cancel a job (for active jobs - queued/processing)
export function useCancelJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (jobId: string) => {
      return cancelJob(jobId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

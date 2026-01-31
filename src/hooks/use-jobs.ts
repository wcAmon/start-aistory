import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'
import { authStore, startNewJob, setSubmitting, setError } from '@/stores'
import type { Job } from '@/lib/supabase'

export interface CreateJobRequest {
  idea: string
  style: 'cinematic' | 'anime'
  voice: 'male' | 'female'
  subtitle_position: 'top' | 'middle' | 'bottom'
  test_mode?: boolean
}

export interface CreateJobResponse {
  job_id: string
  status: string
  queue_position: number
}

// Fetch jobs list
async function fetchJobs(accessToken: string): Promise<Job[]> {
  const response = await fetch('/api/jobs', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to fetch jobs')
  }

  const data = await response.json()
  return data.jobs
}

// Create a new job
async function createJob(
  request: CreateJobRequest,
  accessToken: string
): Promise<CreateJobResponse> {
  const response = await fetch('/api/jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
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
async function fetchJob(jobId: string, accessToken: string): Promise<Job> {
  const response = await fetch(`/api/jobs/${jobId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to fetch job')
  }

  return response.json()
}

// Delete a job
async function deleteJob(jobId: string, accessToken: string): Promise<void> {
  const response = await fetch(`/api/jobs/${jobId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
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

async function cancelJob(jobId: string, accessToken: string): Promise<CancelJobResponse> {
  const response = await fetch(`/api/jobs/${jobId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to cancel job')
  }

  return response.json()
}

// Export fetchJob for use in polling
export { fetchJob }

// Hook: List user's jobs
export function useJobs() {
  const session = useStore(authStore, (state) => state.session)

  return useQuery({
    queryKey: ['jobs'],
    queryFn: () => {
      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }
      return fetchJobs(session.access_token)
    },
    enabled: !!session?.access_token,
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Hook: Get single job
export function useJob(jobId: string | null) {
  const session = useStore(authStore, (state) => state.session)

  return useQuery({
    queryKey: ['jobs', jobId],
    queryFn: () => {
      if (!session?.access_token || !jobId) {
        throw new Error('Not authenticated or no job ID')
      }
      return fetchJob(jobId, session.access_token)
    },
    enabled: !!session?.access_token && !!jobId,
  })
}

// Hook: Create a new job
export function useCreateJob() {
  const queryClient = useQueryClient()
  const session = useStore(authStore, (state) => state.session)

  return useMutation({
    mutationFn: async (request: CreateJobRequest) => {
      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }

      setSubmitting(true)
      setError(null)

      try {
        const result = await createJob(request, session.access_token)
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
  const session = useStore(authStore, (state) => state.session)

  return useMutation({
    mutationFn: async (jobId: string) => {
      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }
      await deleteJob(jobId, session.access_token)
      return jobId
    },
    onSuccess: () => {
      // Invalidate jobs list to refresh
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

// Hook: Cancel a job (for active jobs - queued/processing)
export function useCancelJob() {
  const queryClient = useQueryClient()
  const session = useStore(authStore, (state) => state.session)

  return useMutation({
    mutationFn: async (jobId: string) => {
      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }
      return cancelJob(jobId, session.access_token)
    },
    onSuccess: () => {
      // Invalidate jobs list and current job to refresh
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

import { createFileRoute } from '@tanstack/react-router'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { jobs } from '@/db/schema'

// Helper to verify Supabase JWT token
async function verifyToken(request: Request): Promise<{ userId: string } | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7)
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase configuration')
    return null
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseKey,
      },
    })

    if (!response.ok) {
      return null
    }

    const user = await response.json()
    return { userId: user.id }
  } catch {
    return null
  }
}

export const Route = createFileRoute('/api/jobs')({
  server: {
    handlers: {
      // GET /api/jobs - List user's jobs
      GET: async ({ request }) => {
        const auth = await verifyToken(request)
        if (!auth) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        try {
          const userJobs = await db
            .select()
            .from(jobs)
            .where(eq(jobs.ownerId, auth.userId))
            .orderBy(desc(jobs.createdAt))
            .limit(50)

          // Transform to snake_case for frontend compatibility
          const transformedJobs = userJobs.map((job) => ({
            id: job.id,
            owner_id: job.ownerId,
            idea: job.idea,
            style: job.style,
            voice: job.voice,
            subtitle_position: job.subtitlePosition,
            test_mode: job.testMode,
            status: job.status,
            current_step: job.currentStep,
            error_message: job.errorMessage,
            logs: job.logs,
            video_url: job.videoUrl,
            video_title: job.videoTitle,
            video_description: job.videoDescription,
            video_hashtags: job.videoHashtags,
            video_duration: job.videoDuration,
            generation_time: job.generationTime,
            video_metadata_extended: job.videoMetadataExtended,
            created_at: job.createdAt?.toISOString(),
            updated_at: job.updatedAt?.toISOString(),
            started_at: job.startedAt?.toISOString(),
            completed_at: job.completedAt?.toISOString(),
          }))

          return Response.json({ jobs: transformedJobs })
        } catch (error) {
          console.error('Failed to fetch jobs:', error)
          return Response.json({ error: 'Failed to fetch jobs' }, { status: 500 })
        }
      },

      // POST /api/jobs - Create a new job (proxy to api-server)
      POST: async ({ request }) => {
        const auth = await verifyToken(request)
        if (!auth) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const apiServerUrl = process.env.API_SERVER_URL || 'http://localhost:8000'

        try {
          const body = await request.json()

          // Proxy to api-server
          const response = await fetch(`${apiServerUrl}/api/jobs`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: request.headers.get('authorization') || '',
            },
            body: JSON.stringify(body),
          })

          const data = await response.json()

          if (!response.ok) {
            return Response.json(data, { status: response.status })
          }

          return Response.json(data)
        } catch (error) {
          console.error('Failed to create job:', error)
          return Response.json({ error: 'Failed to create job' }, { status: 500 })
        }
      },
    },
  },
})

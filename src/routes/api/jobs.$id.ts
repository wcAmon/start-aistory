import { createFileRoute } from '@tanstack/react-router'
import { and, eq } from 'drizzle-orm'
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

export const Route = createFileRoute('/api/jobs/$id')({
  server: {
    handlers: {
      // GET /api/jobs/:id - Get a specific job
      GET: async ({ request, params }) => {
        const auth = await verifyToken(request)
        if (!auth) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = params

        try {
          const [job] = await db
            .select()
            .from(jobs)
            .where(and(eq(jobs.id, id), eq(jobs.ownerId, auth.userId)))
            .limit(1)

          if (!job) {
            return Response.json({ error: 'Job not found' }, { status: 404 })
          }

          // Transform to snake_case for frontend compatibility
          const transformedJob = {
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
          }

          return Response.json(transformedJob)
        } catch (error) {
          console.error('Failed to fetch job:', error)
          return Response.json({ error: 'Failed to fetch job' }, { status: 500 })
        }
      },

      // DELETE /api/jobs/:id - Delete a job
      DELETE: async ({ request, params }) => {
        const auth = await verifyToken(request)
        if (!auth) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = params

        try {
          // Check job exists and belongs to user
          const [job] = await db
            .select()
            .from(jobs)
            .where(and(eq(jobs.id, id), eq(jobs.ownerId, auth.userId)))
            .limit(1)

          if (!job) {
            return Response.json({ error: 'Job not found' }, { status: 404 })
          }

          // Don't allow deleting jobs that are still processing
          if (job.status === 'processing') {
            return Response.json({ error: 'Cannot delete a job that is still processing' }, { status: 400 })
          }

          // Delete the job
          await db
            .delete(jobs)
            .where(and(eq(jobs.id, id), eq(jobs.ownerId, auth.userId)))

          return Response.json({ success: true, message: 'Job deleted successfully' })
        } catch (error) {
          console.error('Failed to delete job:', error)
          return Response.json({ error: 'Failed to delete job' }, { status: 500 })
        }
      },
    },
  },
})

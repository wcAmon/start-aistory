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
            image_engine: job.imageEngine,
            language_engine: job.languageEngine,
            test_mode: job.testMode,
            voice: job.voice,
            subtitle_position: job.subtitlePosition,
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

      // DELETE /api/jobs/:id - Cancel or delete a job
      DELETE: async ({ request, params }) => {
        const auth = await verifyToken(request)
        if (!auth) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = params
        const apiServerUrl = process.env.API_SERVER_URL || 'http://localhost:8000'

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

          // For active jobs (queued, processing, cancelling), send cancel to media-engine
          if (job.status === 'queued' || job.status === 'processing' || job.status === 'cancelling') {
            try {
              const cancelResponse = await fetch(`${apiServerUrl}/api/jobs/${id}`, {
                method: 'DELETE',
                headers: {
                  Authorization: request.headers.get('authorization') || '',
                },
              })

              if (cancelResponse.ok) {
                const result = await cancelResponse.json()

                // If job is fully cancelled (not "cancelling"), safe to delete from DB
                if (result.status === 'cancelled') {
                  await db
                    .delete(jobs)
                    .where(and(eq(jobs.id, id), eq(jobs.ownerId, auth.userId)))
                  return Response.json({
                    success: true,
                    message: 'Job cancelled and deleted',
                    status: 'deleted',
                  })
                }

                // If still "cancelling", worker is processing - don't delete yet
                return Response.json({
                  success: true,
                  message: result.message,
                  status: result.status,
                })
              }

              // If media-engine returns 404, job may have finished - allow deletion
              if (cancelResponse.status === 404) {
                // Job not in media-engine, check current DB status and allow deletion
                const [currentJob] = await db
                  .select()
                  .from(jobs)
                  .where(and(eq(jobs.id, id), eq(jobs.ownerId, auth.userId)))
                  .limit(1)

                // If job is now in terminal state, allow deletion
                if (currentJob && ['completed', 'failed', 'cancelled'].includes(currentJob.status)) {
                  await db
                    .delete(jobs)
                    .where(and(eq(jobs.id, id), eq(jobs.ownerId, auth.userId)))
                  return Response.json({ success: true, message: 'Job deleted successfully' })
                }

                // Otherwise, mark as cancelled since media-engine doesn't have it
                await db
                  .update(jobs)
                  .set({ status: 'cancelled' })
                  .where(and(eq(jobs.id, id), eq(jobs.ownerId, auth.userId)))
                return Response.json({
                  success: true,
                  message: 'Job marked as cancelled (not found in processing queue)',
                  status: 'cancelled',
                })
              }

              // Other errors from media-engine
              const errorData = await cancelResponse.json().catch(() => ({}))
              return Response.json(
                { error: errorData.detail || 'Failed to cancel job' },
                { status: cancelResponse.status }
              )
            } catch (fetchError) {
              console.error('Failed to contact media-engine:', fetchError)
              // If media-engine is unreachable, still allow marking as cancelled
              await db
                .update(jobs)
                .set({ status: 'cancelled' })
                .where(and(eq(jobs.id, id), eq(jobs.ownerId, auth.userId)))
              return Response.json({
                success: true,
                message: 'Job marked as cancelled (media-engine unreachable)',
                status: 'cancelled',
              })
            }
          }

          // For terminal states (completed, failed, cancelled), delete directly
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

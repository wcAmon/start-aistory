import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { jobs } from '@/db/schema'

export const Route = createFileRoute('/api/jobs/$id')({
  server: {
    handlers: {
      // GET /api/jobs/:id - Get a specific job
      GET: async ({ params }) => {
        const { id } = params

        try {
          const [job] = await db
            .select()
            .from(jobs)
            .where(eq(jobs.id, id))
            .limit(1)

          if (!job) {
            return Response.json({ error: 'Job not found' }, { status: 404 })
          }

          const transformedJob = {
            id: job.id,
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
      DELETE: async ({ params }) => {
        const { id } = params
        const apiServerUrl = process.env.API_SERVER_URL || 'http://localhost:8000'

        try {
          const [job] = await db
            .select()
            .from(jobs)
            .where(eq(jobs.id, id))
            .limit(1)

          if (!job) {
            return Response.json({ error: 'Job not found' }, { status: 404 })
          }

          // For active jobs, send cancel to media-engine
          if (job.status === 'queued' || job.status === 'processing' || job.status === 'cancelling') {
            try {
              const cancelResponse = await fetch(`${apiServerUrl}/api/jobs/${id}`, {
                method: 'DELETE',
              })

              if (cancelResponse.ok) {
                const result = await cancelResponse.json()

                if (result.status === 'cancelled') {
                  await db.delete(jobs).where(eq(jobs.id, id))
                  return Response.json({
                    success: true,
                    message: 'Job cancelled and deleted',
                    status: 'deleted',
                  })
                }

                return Response.json({
                  success: true,
                  message: result.message,
                  status: result.status,
                })
              }

              if (cancelResponse.status === 404) {
                const [currentJob] = await db
                  .select()
                  .from(jobs)
                  .where(eq(jobs.id, id))
                  .limit(1)

                if (currentJob && ['completed', 'failed', 'cancelled'].includes(currentJob.status)) {
                  await db.delete(jobs).where(eq(jobs.id, id))
                  return Response.json({ success: true, message: 'Job deleted successfully' })
                }

                await db.update(jobs).set({ status: 'cancelled' }).where(eq(jobs.id, id))
                return Response.json({
                  success: true,
                  message: 'Job marked as cancelled (not found in processing queue)',
                  status: 'cancelled',
                })
              }

              const errorData = await cancelResponse.json().catch(() => ({}))
              return Response.json(
                { error: errorData.detail || 'Failed to cancel job' },
                { status: cancelResponse.status }
              )
            } catch (fetchError) {
              console.error('Failed to contact media-engine:', fetchError)
              await db.update(jobs).set({ status: 'cancelled' }).where(eq(jobs.id, id))
              return Response.json({
                success: true,
                message: 'Job marked as cancelled (media-engine unreachable)',
                status: 'cancelled',
              })
            }
          }

          // Terminal states - delete directly
          await db.delete(jobs).where(eq(jobs.id, id))
          return Response.json({ success: true, message: 'Job deleted successfully' })
        } catch (error) {
          console.error('Failed to delete job:', error)
          return Response.json({ error: 'Failed to delete job' }, { status: 500 })
        }
      },
    },
  },
})

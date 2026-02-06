import { createFileRoute } from '@tanstack/react-router'
import { desc } from 'drizzle-orm'
import { db } from '@/db'
import { jobs } from '@/db/schema'

export const Route = createFileRoute('/api/jobs')({
  server: {
    handlers: {
      // GET /api/jobs - List all jobs
      GET: async () => {
        try {
          const allJobs = await db
            .select()
            .from(jobs)
            .orderBy(desc(jobs.createdAt))
            .limit(50)

          // Transform to snake_case for frontend compatibility
          const transformedJobs = allJobs.map((job) => ({
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
          }))

          return Response.json({ jobs: transformedJobs })
        } catch (error) {
          console.error('Failed to fetch jobs:', error)
          return Response.json({ error: 'Failed to fetch jobs' }, { status: 500 })
        }
      },

      // POST /api/jobs - Create a new job (proxy to api-server)
      POST: async ({ request }) => {
        const apiServerUrl = process.env.API_SERVER_URL || 'http://localhost:8000'

        try {
          const body = await request.json()

          // Proxy to api-server (no auth needed)
          const response = await fetch(`${apiServerUrl}/api/jobs`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
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

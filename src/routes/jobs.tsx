'use client'

import { createFileRoute, Link } from '@tanstack/react-router'
import { Loader2, AlertCircle, ArrowLeft, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { JobCard } from '@/components/job-card'
import { useJobs } from '@/hooks/use-jobs'

export const Route = createFileRoute('/jobs')({
  component: JobsPage,
})

function JobsPage() {
  const { data: jobs, isLoading, error, refetch } = useJobs()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold">
            All <span className="text-primary">Videos</span>
          </h1>
          <p className="text-muted-foreground">
            View and manage generated videos
          </p>
        </div>
        <Button asChild className="brutalist-shadow">
          <Link to="/">
            <Video className="mr-2 h-4 w-4" />
            Create New
          </Link>
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 text-center">
          <AlertCircle className="h-8 w-8 mx-auto text-destructive mb-2" />
          <p className="text-destructive mb-4">Failed to load jobs</p>
          <Button variant="outline" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && jobs?.length === 0 && (
        <div className="brutalist-card p-8 text-center">
          <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">No videos yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first AI-generated short video to get started.
          </p>
          <Button asChild className="brutalist-shadow">
            <Link to="/">
              Create Your First Video
            </Link>
          </Button>
        </div>
      )}

      {/* Jobs List */}
      {!isLoading && !error && jobs && jobs.length > 0 && (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}

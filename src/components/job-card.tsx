'use client'

import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Play,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Eye,
} from 'lucide-react'
import type { Job, JobStatus } from '@/lib/supabase'
import { resumeJob } from '@/stores'

interface JobCardProps {
  job: Job
}

function getStatusConfig(status: JobStatus) {
  switch (status) {
    case 'pending':
    case 'queued':
      return {
        icon: Clock,
        label: status === 'pending' ? 'Pending' : 'Queued',
        variant: 'secondary' as const,
        className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
      }
    case 'processing':
      return {
        icon: Loader2,
        label: 'Processing',
        variant: 'secondary' as const,
        className: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
        iconClassName: 'animate-spin',
      }
    case 'completed':
      return {
        icon: CheckCircle,
        label: 'Completed',
        variant: 'secondary' as const,
        className: 'bg-green-500/10 text-green-500 border-green-500/30',
      }
    case 'failed':
      return {
        icon: XCircle,
        label: 'Failed',
        variant: 'destructive' as const,
        className: 'bg-red-500/10 text-red-500 border-red-500/30',
      }
    case 'cancelled':
      return {
        icon: AlertCircle,
        label: 'Cancelled',
        variant: 'secondary' as const,
        className: 'bg-gray-500/10 text-gray-500 border-gray-500/30',
      }
    default:
      return {
        icon: AlertCircle,
        label: status,
        variant: 'secondary' as const,
        className: '',
      }
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatStep(step: string): string {
  return step
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatDuration(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const seconds = Math.round((endDate.getTime() - startDate.getTime()) / 1000)

  if (seconds < 60) return `${seconds}s`

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

export function JobCard({ job }: JobCardProps) {
  const navigate = useNavigate()
  const statusConfig = getStatusConfig(job.status)
  const StatusIcon = statusConfig.icon

  const handleTrack = () => {
    resumeJob(job)
    navigate({ to: '/' })
  }

  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Info */}
          <div className="flex-1 min-w-0">
            {/* Status badge & date */}
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant={statusConfig.variant}
                className={`flex items-center gap-1.5 ${statusConfig.className}`}
              >
                <StatusIcon className={`h-3 w-3 ${statusConfig.iconClassName || ''}`} />
                {statusConfig.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDate(job.created_at)}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-base font-medium text-foreground mb-1 truncate">
              {job.video_title || job.idea.substring(0, 60) + (job.idea.length > 60 ? '...' : '')}
            </h3>

            {/* Idea preview */}
            <p className="text-sm text-muted-foreground line-clamp-2">
              {job.idea}
            </p>

            {/* Current step (if processing) */}
            {job.status === 'processing' && job.current_step && (
              <p className="text-sm text-secondary mt-2">
                Current step: {formatStep(job.current_step)}
              </p>
            )}

            {/* Error message (if failed) */}
            {job.status === 'failed' && job.error_message && (
              <p className="text-sm text-destructive mt-2">
                Error: {job.error_message}
              </p>
            )}

            {/* Duration */}
            {job.completed_at && job.started_at && (
              <p className="text-xs text-muted-foreground mt-2">
                Duration: {formatDuration(job.started_at, job.completed_at)}
              </p>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col gap-2">
            {/* Track Progress button for active jobs */}
            {(job.status === 'pending' || job.status === 'queued' || job.status === 'processing') && (
              <Button
                size="sm"
                className="brutalist-shadow"
                onClick={handleTrack}
              >
                <Eye className="mr-1 h-4 w-4" />
                Track
              </Button>
            )}

            {/* View details button for completed jobs */}
            {job.status === 'completed' && (
              <Button
                size="sm"
                className="brutalist-shadow"
                onClick={handleTrack}
              >
                <Eye className="mr-1 h-4 w-4" />
                View
              </Button>
            )}

            {/* Watch/Download buttons for completed jobs */}
            {job.status === 'completed' && job.video_url && (
              <>
                <Button asChild variant="outline" size="sm">
                  <a href={job.video_url} target="_blank" rel="noopener noreferrer">
                    <Play className="mr-1 h-4 w-4" />
                    Watch
                  </a>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <a href={job.video_url} download>
                    <Download className="mr-1 h-4 w-4" />
                  </a>
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { useState } from 'react'
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
  Trash2,
} from 'lucide-react'
import type { Job, JobStatus } from '@/lib/supabase'
import { resumeJob } from '@/stores'
import { useDeleteJob, useCancelJob } from '@/hooks'

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
    case 'cancelling':
      return {
        icon: Loader2,
        label: 'Cancelling',
        variant: 'secondary' as const,
        className: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
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

function formatVideoDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)

  if (mins === 0) return `${secs}s`
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function JobCard({ job }: JobCardProps) {
  const navigate = useNavigate()
  const deleteJobMutation = useDeleteJob()
  const cancelJobMutation = useCancelJob()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const statusConfig = getStatusConfig(job.status)
  const StatusIcon = statusConfig.icon

  const handleTrack = () => {
    resumeJob(job)
    navigate({ to: '/' })
  }

  const handleDelete = () => {
    deleteJobMutation.mutate(job.id, {
      onSuccess: () => {
        setShowDeleteConfirm(false)
      },
    })
  }

  const handleCancel = () => {
    cancelJobMutation.mutate(job.id, {
      onSuccess: () => {
        setShowCancelConfirm(false)
      },
    })
  }

  const handleDownload = async () => {
    if (!job.video_url) return
    setIsDownloading(true)
    try {
      const response = await fetch(job.video_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${job.video_title || 'video'}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      window.open(job.video_url, '_blank')
    } finally {
      setIsDownloading(false)
    }
  }

  // Can cancel queued/processing jobs, can delete terminal state jobs
  const canCancel = job.status === 'queued' || job.status === 'processing'
  const canDelete = job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled'

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

            {/* Current step (if processing or cancelling) */}
            {(job.status === 'processing' || job.status === 'cancelling') && job.current_step && (
              <p className="text-sm text-secondary mt-2">
                {job.status === 'cancelling' ? 'Stopping at: ' : 'Current step: '}{formatStep(job.current_step)}
              </p>
            )}

            {/* Error message (if failed) */}
            {job.status === 'failed' && job.error_message && (
              <p className="text-sm text-destructive mt-2">
                Error: {job.error_message}
              </p>
            )}

            {/* Video Duration */}
            {job.video_duration && (
              <p className="text-xs text-muted-foreground mt-2">
                Duration: {formatVideoDuration(job.video_duration)}
              </p>
            )}

            {/* Cancel confirmation inline */}
            {showCancelConfirm && (
              <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <p className="text-sm text-orange-500 mb-2">Cancel this job? It will stop at the next checkpoint.</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={handleCancel}
                    disabled={cancelJobMutation.isPending}
                  >
                    {cancelJobMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Cancel Job'
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={cancelJobMutation.isPending}
                  >
                    Keep Running
                  </Button>
                </div>
              </div>
            )}

            {/* Delete confirmation inline */}
            {showDeleteConfirm && (
              <div className="mt-3 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-sm text-destructive mb-2">Delete this job?</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteJobMutation.isPending}
                  >
                    {deleteJobMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Delete'
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleteJobMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col gap-2">
            {/* Track Progress button for active jobs */}
            {(job.status === 'pending' || job.status === 'queued' || job.status === 'processing' || job.status === 'cancelling') && (
              <Button
                size="sm"
                className="brutalist-shadow"
                onClick={handleTrack}
              >
                <Eye className="mr-1 h-4 w-4" />
                Track
              </Button>
            )}

            {/* Cancel button for active jobs */}
            {canCancel && !showCancelConfirm && (
              <Button
                size="sm"
                variant="outline"
                className="text-orange-500 border-orange-500/30 hover:bg-orange-500/10"
                onClick={() => setShowCancelConfirm(true)}
              >
                <XCircle className="mr-1 h-4 w-4" />
                Cancel
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-1 h-4 w-4" />
                  )}
                </Button>
              </>
            )}

            {/* Delete button */}
            {canDelete && !showDeleteConfirm && (
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

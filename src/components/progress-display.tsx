'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Loader2,
  CheckCircle,
  FileText,
  Image,
  Mic,
  Video,
  Type,
  Merge,
  Tags,
  Sparkles,
  Eye,
  Camera,
  Upload,
} from 'lucide-react'
import type { LogEntry } from '@/lib/supabase'

// Workflow steps in order - more detailed to match backend
const WORKFLOW_STEPS = [
  { key: 'generate_script', label: 'Writing Script', icon: FileText, description: 'Creating your story' },
  { key: 'enhance_prompts', label: 'Enhancing Prompts', icon: Sparkles, description: 'Optimizing for shorts' },
  { key: 'generate_character', label: 'Creating Character', icon: Image, description: 'Designing character look' },
  { key: 'generate_images', label: 'Generating Images', icon: Image, description: 'Creating scene visuals' },
  { key: 'validate_images', label: 'Validating Images', icon: Eye, description: 'Quality check' },
  { key: 'review_video_prompts', label: 'Reviewing Prompts', icon: Camera, description: 'Preparing motion' },
  { key: 'generate_audio', label: 'Creating Voiceover', icon: Mic, description: 'Recording narration' },
  { key: 'generate_videos', label: 'Generating Videos', icon: Video, description: 'Creating video clips' },
  { key: 'add_subtitles', label: 'Adding Subtitles', icon: Type, description: 'Burning captions' },
  { key: 'merge_videos', label: 'Merging Videos', icon: Merge, description: 'Combining scenes' },
  { key: 'generate_metadata', label: 'Finalizing', icon: Tags, description: 'Creating title & tags' },
  { key: 'upload', label: 'Uploading', icon: Upload, description: 'Saving your video' },
] as const

interface ProgressDisplayProps {
  currentStep: string
  logs: LogEntry[]
}

// Extract progress info from latest log for current step
function getStepProgress(logs: LogEntry[], step: string): { current: number; total: number } | null {
  // Find the most recent log for this step with progress info
  for (let i = logs.length - 1; i >= 0; i--) {
    const log = logs[i]
    if (log.step === step && log.progress?.current && log.progress?.total) {
      return { current: log.progress.current, total: log.progress.total }
    }
  }
  return null
}

// Get the latest message for a step
function getStepMessage(logs: LogEntry[], step: string): string | null {
  for (let i = logs.length - 1; i >= 0; i--) {
    if (logs[i].step === step) {
      return logs[i].message
    }
  }
  return null
}

export function ProgressDisplay({ currentStep, logs }: ProgressDisplayProps) {
  // Calculate progress percentage with sub-step consideration
  const currentStepIndex = WORKFLOW_STEPS.findIndex((s) => s.key === currentStep)
  const stepProgress = getStepProgress(logs, currentStep)

  // Base progress from completed steps + partial progress within current step
  let progress = 0
  if (currentStepIndex >= 0) {
    const baseProgress = (currentStepIndex / WORKFLOW_STEPS.length) * 100
    const stepContribution = (1 / WORKFLOW_STEPS.length) * 100

    if (stepProgress) {
      // Add partial progress within the step
      const subProgress = (stepProgress.current / stepProgress.total) * stepContribution
      progress = Math.round(baseProgress + subProgress)
    } else {
      // Just started this step
      progress = Math.round(baseProgress + stepContribution * 0.1)
    }
  }

  // Get elapsed time from logs
  const latestLog = logs[logs.length - 1]
  const elapsedSeconds = latestLog?.elapsed_seconds ?? 0

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Get current step message
  const currentMessage = getStepMessage(logs, currentStep)

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Progress Card */}
      <Card className="brutalist-card overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Generating Your Video</CardTitle>
            <Badge variant="secondary" className="font-mono">
              {formatTime(elapsedSeconds)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-primary">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3 progress-glow" />
          </div>

          <Separator />

          {/* Steps */}
          <div className="space-y-2">
            {WORKFLOW_STEPS.map((step, index) => {
              const isCompleted = currentStepIndex > index
              const isCurrent = step.key === currentStep
              const StepIcon = step.icon

              // Get sub-progress for multi-item steps
              const subProgress = isCurrent ? getStepProgress(logs, step.key) : null

              return (
                <div
                  key={step.key}
                  className={`rounded-lg transition-all ${
                    isCurrent
                      ? 'bg-primary/10 border border-primary/30'
                      : isCompleted
                        ? 'opacity-70'
                        : 'opacity-40'
                  }`}
                >
                  <div className="flex items-center gap-3 p-2">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${
                        isCompleted
                          ? 'bg-green-500/20 text-green-500'
                          : isCurrent
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : isCurrent ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <StepIcon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            isCurrent ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {step.label}
                        </span>
                        {isCurrent && subProgress && (
                          <span className="text-xs text-primary font-mono">
                            ({subProgress.current}/{subProgress.total})
                          </span>
                        )}
                      </div>
                      {isCurrent && (
                        <p className="text-xs text-muted-foreground truncate">
                          {currentMessage || step.description}
                        </p>
                      )}
                    </div>
                    {isCurrent && (
                      <Badge variant="outline" className="text-xs shrink-0">
                        Active
                      </Badge>
                    )}
                    {isCompleted && (
                      <span className="text-xs text-green-500 shrink-0">Done</span>
                    )}
                  </div>
                  {/* Sub-progress bar for multi-item steps */}
                  {isCurrent && subProgress && (
                    <div className="px-2 pb-2">
                      <Progress
                        value={(subProgress.current / subProgress.total) * 100}
                        className="h-1"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Logs */}
      {logs.length > 0 && (
        <Card className="bg-muted/30 border-border">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">Activity Log</CardTitle>
              <span className="text-xs text-muted-foreground">{logs.length} events</span>
            </div>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-xs">
              {logs.slice(-12).map((log, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 ${
                    log.level === 'error'
                      ? 'text-destructive'
                      : log.level === 'success'
                        ? 'text-green-500'
                        : log.level === 'progress'
                          ? 'text-blue-400'
                          : 'text-muted-foreground'
                  }`}
                >
                  <span className="opacity-50 shrink-0 tabular-nums">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className={`shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 ${
                    log.level === 'error'
                      ? 'bg-destructive'
                      : log.level === 'success'
                        ? 'bg-green-500'
                        : log.level === 'progress'
                          ? 'bg-blue-400'
                          : 'bg-muted-foreground'
                  }`} />
                  <span className="break-words">{log.message}</span>
                  {log.progress?.current && log.progress?.total && (
                    <span className="shrink-0 text-muted-foreground/50">
                      [{log.progress.current}/{log.progress.total}]
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

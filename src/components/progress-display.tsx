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
} from 'lucide-react'
import type { LogEntry } from '@/lib/supabase'

// Workflow steps in order
const WORKFLOW_STEPS = [
  { key: 'analyze_idea', label: 'Analyzing Idea', icon: FileText },
  { key: 'generate_script', label: 'Writing Script', icon: FileText },
  { key: 'generate_character', label: 'Creating Character', icon: Image },
  { key: 'generate_images', label: 'Generating Images', icon: Image },
  { key: 'generate_audio', label: 'Creating Voiceover', icon: Mic },
  { key: 'generate_videos', label: 'Generating Videos', icon: Video },
  { key: 'add_subtitles', label: 'Adding Subtitles', icon: Type },
  { key: 'merge_videos', label: 'Merging Videos', icon: Merge },
  { key: 'generate_metadata', label: 'Finalizing', icon: Tags },
] as const

interface ProgressDisplayProps {
  currentStep: string
  logs: LogEntry[]
}

export function ProgressDisplay({ currentStep, logs }: ProgressDisplayProps) {
  // Calculate progress percentage
  const currentStepIndex = WORKFLOW_STEPS.findIndex((s) => s.key === currentStep)
  const progress = currentStepIndex >= 0
    ? Math.round(((currentStepIndex + 1) / WORKFLOW_STEPS.length) * 100)
    : 0

  // Get elapsed time from logs
  const latestLog = logs[logs.length - 1]
  const elapsedSeconds = latestLog?.elapsed_seconds ?? 0

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

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
          <div className="space-y-3">
            {WORKFLOW_STEPS.map((step, index) => {
              const isCompleted = currentStepIndex > index
              const isCurrent = step.key === currentStep

              const StepIcon = step.icon

              return (
                <div
                  key={step.key}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                    isCurrent
                      ? 'bg-primary/10 border border-primary/30'
                      : isCompleted
                        ? 'opacity-60'
                        : 'opacity-40'
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
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
                  <span
                    className={`text-sm font-medium ${
                      isCurrent ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                  {isCurrent && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      In Progress
                    </Badge>
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
            <CardTitle className="text-sm text-muted-foreground">Activity Log</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <div className="space-y-1 max-h-40 overflow-y-auto font-mono text-xs">
              {logs.slice(-10).map((log, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${
                    log.level === 'error'
                      ? 'text-destructive'
                      : log.level === 'success'
                        ? 'text-green-500'
                        : 'text-muted-foreground'
                  }`}
                >
                  <span className="opacity-50">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

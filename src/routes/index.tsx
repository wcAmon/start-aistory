'use client'

import { createFileRoute } from '@tanstack/react-router'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthForm } from '@/components/auth-form'
import { GeneratorForm } from '@/components/generator-form'
import { ProgressDisplay } from '@/components/progress-display'
import { VideoPreview } from '@/components/video-preview'
import { useAuth, useJobState, useCreateJob, type CreateJobRequest } from '@/hooks'
import { resetJob } from '@/stores'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const { appState, error, isSubmitting, logs, currentStep, completionData, queuePosition } = useJobState()
  const createJobMutation = useCreateJob()

  const handleSubmit = (request: CreateJobRequest) => {
    createJobMutation.mutate(request)
  }

  const handleCreateAnother = () => {
    resetJob()
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  // Show auth form if not logged in
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            AI <span className="text-primary">Shorts</span> Generator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create professional short videos with AI-generated scripts, cinematic visuals,
            voiceover, and word-by-word subtitles. Ready for upload in one click.
          </p>
        </div>
        <AuthForm />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Idle State - Show Generator Form */}
      {appState === 'idle' && (
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Create Your <span className="text-primary">AI Short</span>
            </h1>
            <p className="text-muted-foreground">
              Enter your video idea and let AI generate a professional short video.
            </p>
          </div>
          <GeneratorForm onSubmit={handleSubmit} isLoading={isSubmitting} />
        </div>
      )}

      {/* Queued State */}
      {appState === 'queued' && (
        <div className="max-w-md mx-auto text-center">
          <div className="brutalist-card p-8">
            <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
            <h2 className="text-xl font-bold mb-2">In Queue</h2>
            <p className="text-muted-foreground mb-2">
              Your video is waiting to be processed.
            </p>
            {queuePosition && (
              <p className="text-primary font-medium">
                Position in queue: #{queuePosition}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Generating State */}
      {appState === 'generating' && (
        <ProgressDisplay currentStep={currentStep} logs={logs} />
      )}

      {/* Complete State */}
      {appState === 'complete' && completionData && (
        <VideoPreview
          videoUrl={completionData.videoUrl}
          suggestedTitle={completionData.suggestedTitle}
          suggestedDescription={completionData.suggestedDescription}
          suggestedHashtags={completionData.suggestedHashtags}
          onCreateAnother={handleCreateAnother}
        />
      )}

      {/* Error State */}
      {appState === 'error' && (
        <div className="max-w-md mx-auto text-center">
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-6">
              {error || 'An unexpected error occurred'}
            </p>
            <Button onClick={handleCreateAnother} className="brutalist-shadow">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

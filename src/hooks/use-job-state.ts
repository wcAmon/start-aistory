import { useMemo } from 'react'
import { useStore } from '@tanstack/react-store'
import { jobStore } from '@/stores'

export function useJobState() {
  const currentJobId = useStore(jobStore, (state) => state.currentJobId)
  const currentJob = useStore(jobStore, (state) => state.currentJob)
  const queuePosition = useStore(jobStore, (state) => state.queuePosition)
  const appState = useStore(jobStore, (state) => state.appState)
  const error = useStore(jobStore, (state) => state.error)
  const isSubmitting = useStore(jobStore, (state) => state.isSubmitting)

  // Derive logs from currentJob (reactive)
  const logs = useMemo(() => currentJob?.logs ?? [], [currentJob?.logs])

  // Derive currentStep from currentJob (reactive)
  const currentStep = useMemo(() => currentJob?.current_step ?? '', [currentJob?.current_step])

  // Derive completionData from currentJob (reactive)
  const completionData = useMemo(() => {
    if (!currentJob || currentJob.status !== 'completed') return null
    const extended = currentJob.video_metadata_extended
    return {
      videoUrl: currentJob.video_url ?? '',
      suggestedTitle: currentJob.video_title ?? '',
      suggestedDescription: currentJob.video_description ?? '',
      suggestedHashtags: currentJob.video_hashtags ?? [],
      titleVariants: extended?.title_variants ?? [],
      recommendedTitleIndex: extended?.recommended_title_index ?? 0,
      viralityScore: extended?.virality_analysis?.estimated_score ?? null,
      generationTime: currentJob.generation_time ?? null,
    }
  }, [currentJob])

  return {
    currentJobId,
    currentJob,
    queuePosition,
    appState,
    error,
    isSubmitting,
    logs,
    currentStep,
    completionData,
  }
}

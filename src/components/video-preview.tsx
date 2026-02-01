'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Play,
  Download,
  Copy,
  Check,
  RefreshCw,
  Share2,
  Sparkles,
  Hash,
  Loader2,
  Clock,
  Star,
} from 'lucide-react'
import type { TitleVariant } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface VideoPreviewProps {
  videoUrl: string
  suggestedTitle: string
  suggestedDescription: string
  suggestedHashtags: string[]
  titleVariants?: TitleVariant[]
  recommendedTitleIndex?: number
  viralityScore?: number | null
  generationTime?: number | null
  onCreateAnother: () => void
}

const STYLE_LABELS: Record<TitleVariant['style'], string> = {
  story: 'Story',
  clickbait: 'Clickbait',
  question: 'Question',
  emotional: 'Emotional',
}

export function VideoPreview({
  videoUrl,
  suggestedTitle,
  suggestedDescription,
  suggestedHashtags,
  titleVariants = [],
  recommendedTitleIndex = 0,
  viralityScore,
  generationTime,
  onCreateAnother,
}: VideoPreviewProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [selectedTitleIndex, setSelectedTitleIndex] = useState(recommendedTitleIndex)

  // Get current selected title
  const currentTitle = titleVariants.length > 0
    ? titleVariants[selectedTitleIndex]?.text ?? suggestedTitle
    : suggestedTitle

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const copyAll = async () => {
    const fullText = `${currentTitle}\n\n${suggestedDescription}\n\n${suggestedHashtags.map((t) => `#${t}`).join(' ')}`
    await copyToClipboard(fullText, 'all')
  }

  const formatGenerationTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}m ${secs}s`
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch(videoUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${suggestedTitle || 'video'}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      window.open(videoUrl, '_blank')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Player */}
        <Card className="brutalist-card overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              Your Video is Ready!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Video Container - 9:16 aspect ratio */}
            <div className="video-card glow-gold">
              <video
                src={videoUrl}
                controls
                className="absolute inset-0 w-full h-full object-cover"
                poster=""
              />
            </div>

            {/* Stats Row */}
            {(generationTime || viralityScore) && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {generationTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Generated in {formatGenerationTime(generationTime)}</span>
                  </div>
                )}
                {viralityScore && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Virality: {viralityScore}/100</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button asChild className="flex-1 brutalist-shadow">
                <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                  <Play className="mr-2 h-4 w-4" />
                  Watch Full Screen
                </a>
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {isDownloading ? 'Downloading...' : 'Download'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <div className="space-y-4">
          {/* Title with Variants */}
          <Card className="bg-card border-border">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground">
                  {titleVariants.length > 0 ? 'Choose Your Title' : 'Suggested Title'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(currentTitle, 'title')}
                >
                  {copiedField === 'title' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {titleVariants.length > 0 ? (
                <div className="space-y-2">
                  {titleVariants.map((variant, index) => (
                    <button
                      key={variant.style}
                      type="button"
                      onClick={() => setSelectedTitleIndex(index)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-all",
                        selectedTitleIndex === index
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={selectedTitleIndex === index ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {STYLE_LABELS[variant.style]}
                        </Badge>
                        {index === recommendedTitleIndex && (
                          <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium text-sm">{variant.text}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="font-medium">{suggestedTitle}</p>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="bg-card border-border">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground">Suggested Description</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(suggestedDescription, 'description')}
                >
                  {copiedField === 'description' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {suggestedDescription}
              </p>
            </CardContent>
          </Card>

          {/* Hashtags */}
          <Card className="bg-card border-border">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Hashtags
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      suggestedHashtags.map((t) => `#${t}`).join(' '),
                      'hashtags'
                    )
                  }
                >
                  {copiedField === 'hashtags' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {suggestedHashtags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={copyAll}
            >
              {copiedField === 'all' ? (
                <Check className="mr-2 h-4 w-4 text-green-500" />
              ) : (
                <Share2 className="mr-2 h-4 w-4" />
              )}
              Copy All
            </Button>
            <Button
              className="flex-1 brutalist-shadow"
              onClick={onCreateAnother}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Create Another
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

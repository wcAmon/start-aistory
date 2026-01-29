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
} from 'lucide-react'

interface VideoPreviewProps {
  videoUrl: string
  suggestedTitle: string
  suggestedDescription: string
  suggestedHashtags: string[]
  onCreateAnother: () => void
}

export function VideoPreview({
  videoUrl,
  suggestedTitle,
  suggestedDescription,
  suggestedHashtags,
  onCreateAnother,
}: VideoPreviewProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const copyAll = async () => {
    const fullText = `${suggestedTitle}\n\n${suggestedDescription}\n\n${suggestedHashtags.map((t) => `#${t}`).join(' ')}`
    await copyToClipboard(fullText, 'all')
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
                className="absolute inset-0 w-full h-full object-contain bg-black"
                poster=""
              />
            </div>

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
          {/* Title */}
          <Card className="bg-card border-border">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground">Suggested Title</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(suggestedTitle, 'title')}
                >
                  {copiedField === 'title' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="font-medium">{suggestedTitle}</p>
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

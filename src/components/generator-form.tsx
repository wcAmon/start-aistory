'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Sparkles, Film, Palette, Mic, AlignVerticalJustifyCenter, FlaskConical } from 'lucide-react'
import type { CreateJobRequest } from '@/hooks'

interface GeneratorFormProps {
  onSubmit: (data: CreateJobRequest) => void
  isLoading?: boolean
}

export function GeneratorForm({ onSubmit, isLoading = false }: GeneratorFormProps) {
  const [idea, setIdea] = useState('')
  const [style, setStyle] = useState<'cinematic' | 'anime'>('cinematic')
  const [voice, setVoice] = useState<'male' | 'female'>('male')
  const [subtitlePosition, setSubtitlePosition] = useState<'top' | 'middle' | 'bottom'>('bottom')
  const [testMode, setTestMode] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!idea.trim()) return

    onSubmit({
      idea: idea.trim(),
      style,
      voice,
      subtitle_position: subtitlePosition,
      test_mode: testMode,
    })
  }

  return (
    <Card className="brutalist-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="h-5 w-5 text-primary" />
          Create Your AI Short
        </CardTitle>
        <CardDescription>
          Enter your video idea and let AI generate a professional short video with voiceover and subtitles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video Idea */}
          <div className="space-y-2">
            <Label htmlFor="idea" className="text-base font-medium">
              Video Idea
            </Label>
            <Textarea
              id="idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Describe your video idea... e.g., 'A story about a lonely robot who discovers the meaning of friendship in a futuristic city'"
              className="min-h-[120px] resize-none"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Be descriptive! The more detail you provide, the better the result.
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Style */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-secondary" />
                Visual Style
              </Label>
              <Select
                value={style}
                onValueChange={(v) => setStyle(v as 'cinematic' | 'anime')}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cinematic">
                    <span className="flex items-center gap-2">
                      <Film className="h-4 w-4" />
                      Cinematic
                    </span>
                  </SelectItem>
                  <SelectItem value="anime">
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Anime
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Voice */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-secondary" />
                Voice
              </Label>
              <Select
                value={voice}
                onValueChange={(v) => setVoice(v as 'male' | 'female')}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subtitle Position */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <AlignVerticalJustifyCenter className="h-4 w-4 text-secondary" />
                Subtitles
              </Label>
              <Select
                value={subtitlePosition}
                onValueChange={(v) => setSubtitlePosition(v as 'top' | 'middle' | 'bottom')}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="middle">Middle</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Test Mode */}
          <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30">
            <input
              type="checkbox"
              id="testMode"
              checked={testMode}
              onChange={(e) => setTestMode(e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="testMode" className="flex items-center gap-2 cursor-pointer text-sm">
              <FlaskConical className="h-4 w-4 text-orange-500" />
              <span>Test Mode</span>
              <span className="text-muted-foreground">(2 scenes only, faster)</span>
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full brutalist-shadow text-lg font-bold"
            disabled={isLoading || !idea.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Video
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

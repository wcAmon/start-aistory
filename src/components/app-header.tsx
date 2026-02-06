'use client'

import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Sparkles, History } from 'lucide-react'

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo - clickable to go home */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity cursor-pointer">
          <div className="p-1.5 rounded-lg bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span>AI Shorts</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/jobs" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}

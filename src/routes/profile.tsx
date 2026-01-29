'use client'

import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Loader2, ArrowLeft, User, Lock, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AuthForm } from '@/components/auth-form'
import { useAuth } from '@/hooks'
import { updateUserProfile, updateUserPassword } from '@/stores'
import { usernameSchema, passwordChangeSchema } from '@/lib/validation'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

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
            Sign in to manage your profile.
          </p>
        </div>
        <AuthForm />
      </div>
    )
  }

  const currentUsername = user.user_metadata?.username || ''

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsUpdatingProfile(true)
    setProfileError(null)
    setProfileSuccess(false)

    const formData = new FormData(e.currentTarget)
    const username = formData.get('username') as string

    try {
      // Validate username if provided
      if (username) {
        const result = usernameSchema.safeParse(username)
        if (!result.success) {
          setProfileError(result.error.issues[0].message)
          setIsUpdatingProfile(false)
          return
        }
      }

      await updateUserProfile({ username: username || undefined })
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsUpdatingPassword(true)
    setPasswordError(null)
    setPasswordSuccess(false)

    const formData = new FormData(e.currentTarget)
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    try {
      // Validate passwords
      const result = passwordChangeSchema.safeParse({ newPassword, confirmPassword })
      if (!result.success) {
        setPasswordError(result.error.issues[0].message)
        setIsUpdatingPassword(false)
        return
      }

      await updateUserPassword(newPassword)
      setPasswordSuccess(true)
      setTimeout(() => setPasswordSuccess(false), 3000)

      // Clear form
      e.currentTarget.reset()
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <h1 className="text-2xl font-bold">
          Your <span className="text-primary">Profile</span>
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile Settings */}
        <Card className="brutalist-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your display name and profile details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  defaultValue={currentUsername}
                  disabled={isUpdatingProfile}
                />
                <p className="text-xs text-muted-foreground">
                  2-50 characters, letters, numbers, underscores, and hyphens only
                </p>
              </div>

              {profileError && (
                <p className="text-sm text-destructive">{profileError}</p>
              )}

              {profileSuccess && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  Profile updated successfully
                </p>
              )}

              <Button
                type="submit"
                className="brutalist-shadow"
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        <Separator />

        {/* Password Settings */}
        <Card className="brutalist-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your account password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  required
                  disabled={isUpdatingPassword}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  required
                  disabled={isUpdatingPassword}
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters
                </p>
              </div>

              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}

              {passwordSuccess && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  Password changed successfully
                </p>
              )}

              <Button
                type="submit"
                className="brutalist-shadow"
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Change Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

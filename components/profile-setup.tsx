"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ProfileSetupProps {
  onProfileCreated: (slug: string, name: string) => void
}

export function ProfileSetup({ onProfileCreated }: ProfileSetupProps) {
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateSlug = (inputName: string) => {
    return inputName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const handleNameChange = (value: string) => {
    setName(value)
    setSlug(generateSlug(value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !slug.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      onProfileCreated(slug, name)
    } catch (err) {
      setError("Failed to create profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const shareableUrl = slug ? `${window.location.origin}/profile/${slug}` : ""

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-light text-gray-800">Create Your DSA Profile</CardTitle>
          <p className="text-gray-600 text-sm">Share your coding progress with others</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Profile URL</Label>
              <Input
                id="slug"
                type="text"
                placeholder="your-profile-url"
                value={slug}
                onChange={(e) => setSlug(generateSlug(e.target.value))}
                required
                className="h-12"
              />
              {slug && <p className="text-xs text-gray-500 break-all">Your shareable link: {shareableUrl}</p>}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" disabled={isLoading || !name.trim() || !slug.trim()} className="w-full h-12">
              {isLoading ? "Creating Profile..." : "Create Profile & Start Tracking"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Create your unique profile</li>
              <li>• Track your DSA progress daily</li>
              <li>• Share your profile link with anyone</li>
              <li>• Others can view your progress in real-time</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

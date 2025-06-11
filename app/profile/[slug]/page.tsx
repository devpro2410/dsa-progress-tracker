"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Calendar } from "@/components/calendar"
import { Dashboard } from "@/components/dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink } from "lucide-react"
import { getProfileBySlug, getProfileEntries, type PublicProfile } from "@/lib/public-data-service"
import type { DSAData } from "@/app/page"

export default function PublicProfilePage() {
  const params = useParams()
  const slug = params.slug as string

  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [data, setData] = useState<DSAData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!slug) return

      setIsLoading(true)
      try {
        const profileData = await getProfileBySlug(slug)
        if (!profileData) {
          setError("Profile not found")
          return
        }

        setProfile(profileData)
        const entriesData = await getProfileEntries(profileData.id)
        setData(entriesData)
      } catch (err) {
        setError("Failed to load profile")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [slug])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
  }

  const getCurrentStreak = () => {
    const dates = Object.keys(data)
      .filter((date) => {
        const entry = data[date]
        return Object.values(entry).some((count) => count > 0)
      })
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    if (dates.length === 0) return 0

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const latestDate = new Date(dates[0])
    latestDate.setHours(0, 0, 0, 0)

    const daysDiff = Math.floor((today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff > 1) return 0

    for (let i = 0; i < dates.length; i++) {
      const currentDate = new Date(dates[i])
      currentDate.setHours(0, 0, 0, 0)

      if (i === 0) {
        streak = 1
      } else {
        const prevDate = new Date(dates[i - 1])
        prevDate.setHours(0, 0, 0, 0)

        const diff = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))

        if (diff === 1) {
          streak++
        } else {
          break
        }
      }
    }

    return streak
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h1>
          <p className="text-gray-600 mb-4">{error || "The profile you're looking for doesn't exist."}</p>
          <Button onClick={() => (window.location.href = "/")} variant="outline">
            Create Your Own Profile
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-3xl font-light text-gray-800">{profile.name}'s DSA Progress</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open("/", "_blank")}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-gray-600">Data Structures & Algorithms Progress Tracker</p>
            {getCurrentStreak() > 0 && (
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                🔥 {getCurrentStreak()} day streak
              </div>
            )}
          </div>
        </header>

        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <Calendar data={data} onDateClick={() => {}} />
          </TabsContent>

          <TabsContent value="dashboard">
            <Dashboard data={data} onDataImport={() => {}} />
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">Want to track your own DSA progress?</p>
          <Button onClick={() => (window.location.href = "/")} variant="outline">
            Create Your Profile
          </Button>
        </div>
      </div>
    </div>
  )
}

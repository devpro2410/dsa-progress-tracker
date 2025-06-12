"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/calendar"
import { Dashboard } from "@/components/dashboard"
import { DailyEntryModal } from "@/components/daily-entry-modal"
import { AdminPanel } from "@/components/admin-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getEntries, saveEntry } from "@/lib/data-service"

export interface DSAEntry {
  [key: string]: number
}

export interface DSAData {
  [date: string]: DSAEntry
}

export const DSA_TOPICS = [
  { name: "Sorting", total: 5 },
  { name: "Arrays", total: 31 },
  { name: "Linked Lists", total: 45 },
  { name: "Binary Search", total: 28 },
  { name: "Hashing", total: 4 },
  { name: "Recursion", total: 17 },
  { name: "Greedy Algorithms", total: 11 },
  { name: "Sliding Window", total: 11 },
  { name: "Stack/Queues", total: 23 },
  { name: "Binary Trees", total: 30 },
  { name: "Binary Search Trees", total: 14 },
  { name: "Heaps", total: 10 },
  { name: "Graphs", total: 36 },
  { name: "Tries", total: 6 },
  { name: "Dynamic Programming", total: 47 },
  { name: "Strings (Advanced Algo)", total: 8 },
  { name: "Maths", total: 3 },
  { name: "Bit Manipulation", total: 8 },
]

export default function DSATracker() {
  const [data, setData] = useState<DSAData>({})
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdminMode, setIsAdminMode] = useState(false)

  // Load data from Supabase on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const entriesData = await getEntries()
      setData(entriesData)
      setIsLoading(false)
    }

    fetchData()
  }, [])

  const handleDateClick = (date: string) => {
    if (!isAdminMode) return // Only allow editing in admin mode
    setSelectedDate(date)
    setIsModalOpen(true)
  }

  const handleSaveEntry = async (entry: DSAEntry) => {
    if (selectedDate && isAdminMode) {
      setIsLoading(true)
      const success = await saveEntry(selectedDate, entry)

      if (success) {
        // Check if all values are zero - if so, remove from local data
        const hasAnyQuestions = Object.values(entry).some((count) => count > 0)

        if (hasAnyQuestions) {
          // Update the data with the new entry
          setData((prev) => ({
            ...prev,
            [selectedDate]: entry,
          }))
        } else {
          // Remove the date from local data since all values are zero
          setData((prev) => {
            const newData = { ...prev }
            delete newData[selectedDate]
            return newData
          })
        }
      }

      setIsLoading(false)
    }
    setIsModalOpen(false)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedDate(null)
  }

  const handleAuthenticateAdmin = () => {
    setIsAdminMode(true)
  }

  const handleToggleAdminMode = () => {
    setIsAdminMode(false)
  }

  // Calculate current streak
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

  if (isLoading && !Object.keys(data).length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading DSA progress...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminPanel
        isAdminMode={isAdminMode}
        onToggleAdminMode={handleToggleAdminMode}
        onAuthenticateAdmin={handleAuthenticateAdmin}
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-light text-gray-800 mb-2">My DSA Progress Journey</h1>
          <div className="flex flex-col items-center gap-2">
            <p className="text-gray-600">Daily Data Structures & Algorithms Practice Tracker</p>

            {/* Profile Links */}
            <div className="flex items-center gap-4 text-sm">
              <a
                href="https://leetcode.com/u/devpro2410/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
              >
                <span>🔗</span>
                <span>LeetCode Profile</span>
              </a>
              <a
                href="https://takeuforward.org/plus/profile/sivansh2410"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors"
              >
                <span>📚</span>
                <span>TUF Profile</span>
              </a>
            </div>

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
            <Calendar data={data} onDateClick={handleDateClick} />
          </TabsContent>

          <TabsContent value="dashboard">
            <Dashboard data={data} onDataImport={() => {}} />
          </TabsContent>
        </Tabs>

        {isAdminMode && (
          <DailyEntryModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveEntry}
            selectedDate={selectedDate}
            existingEntry={selectedDate ? data[selectedDate] : undefined}
          />
        )}

        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>Following my journey in mastering Data Structures & Algorithms</p>
        </footer>
      </div>
    </div>
  )
}

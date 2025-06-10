"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/calendar"
import { Dashboard } from "@/components/dashboard"
import { DailyEntryModal } from "@/components/daily-entry-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("dsa-progress-data")
    if (savedData) {
      setData(JSON.parse(savedData))
    }
  }, [])

  // Save data to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("dsa-progress-data", JSON.stringify(data))
  }, [data])

  const handleDateClick = (date: string) => {
    setSelectedDate(date)
    setIsModalOpen(true)
  }

  const handleSaveEntry = (entry: DSAEntry) => {
    if (selectedDate) {
      setData((prev) => ({
        ...prev,
        [selectedDate]: entry,
      }))
    }
    setIsModalOpen(false)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedDate(null)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-light text-gray-800 mb-2">DSA Progress Tracker</h1>
          <p className="text-gray-600 mb-2">Track your daily Data Structures & Algorithms practice</p>
          {getCurrentStreak() > 0 && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
              🔥 {getCurrentStreak()} day streak
            </div>
          )}
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
            <Dashboard data={data} />
          </TabsContent>
        </Tabs>

        <DailyEntryModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveEntry}
          selectedDate={selectedDate}
          existingEntry={selectedDate ? data[selectedDate] : undefined}
        />
      </div>
    </div>
  )
}

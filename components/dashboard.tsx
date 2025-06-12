"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type DSAData, DSA_TOPICS } from "@/app/page"
import { DataManager } from "@/components/data-manager"

interface DashboardProps {
  data: DSAData
  onDataImport: (data: DSAData) => void
  isAdminMode?: boolean // Add admin mode prop
}

export function Dashboard({ data, onDataImport, isAdminMode = false }: DashboardProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>("all")

  // Calculate total questions solved
  const getTotalQuestionsSolved = () => {
    return Object.values(data).reduce((total, entry) => {
      return total + Object.values(entry).reduce((sum, count) => sum + count, 0)
    }, 0)
  }

  // Calculate questions solved per topic
  const getTopicProgress = () => {
    return DSA_TOPICS.map((topic) => {
      const solved = Object.values(data).reduce((total, entry) => {
        return total + (entry[topic.name] || 0)
      }, 0)

      return {
        name: topic.name,
        solved,
        total: topic.total,
        percentage: topic.total > 0 ? (solved / topic.total) * 100 : 0,
      }
    })
  }

  // Get daily progress for a specific topic (only days with questions > 0)
  const getTopicDailyProgress = (topicName: string) => {
    return Object.entries(data)
      .filter(([_, entry]) => entry[topicName] > 0)
      .map(([date, entry]) => ({
        date,
        count: entry[topicName],
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  // Get all daily progress (only days with at least 1 question)
  const getAllDailyProgress = () => {
    return Object.entries(data)
      .filter(([_, entry]) => {
        const totalForDay = Object.values(entry).reduce((sum, count) => sum + count, 0)
        return totalForDay > 0
      })
      .map(([date, entry]) => ({
        date,
        total: Object.values(entry).reduce((sum, count) => sum + count, 0),
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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

    // Check if today or yesterday has an entry (to account for different time zones)
    const latestDate = new Date(dates[0])
    latestDate.setHours(0, 0, 0, 0)

    const daysDiff = Math.floor((today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff > 1) return 0 // Streak is broken if more than 1 day gap

    // Count consecutive days
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

  // Get active days count (only days with questions > 0)
  const getActiveDaysCount = () => {
    return Object.keys(data).filter((date) => {
      const entry = data[date]
      return Object.values(entry).some((count) => count > 0)
    }).length
  }

  const totalSolved = getTotalQuestionsSolved()
  const topicProgress = getTopicProgress()
  const totalQuestions = DSA_TOPICS.reduce((sum, topic) => sum + topic.total, 0)
  const activeDaysCount = getActiveDaysCount()

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Questions Solved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{totalSolved}</div>
            <p className="text-xs text-gray-500">out of {totalQuestions} questions</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 0}%
            </div>
            <Progress value={(totalSolved / totalQuestions) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{getCurrentStreak()}</div>
            <p className="text-xs text-gray-500">consecutive days</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{activeDaysCount}</div>
            <p className="text-xs text-gray-500">days with practice</p>
          </CardContent>
        </Card>
      </div>

      {/* Topic Progress */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-gray-800">Topic Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topicProgress.map((topic) => {
              const isCompleted = topic.solved >= topic.total

              return (
                <div key={topic.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-sm font-medium ${isCompleted ? "text-green-700" : "text-gray-700"} flex items-center gap-2`}
                    >
                      {topic.name}
                      {isCompleted && <span className="text-green-600 text-xs">✓</span>}
                    </span>
                    <span className={`text-sm ${isCompleted ? "text-green-600 font-medium" : "text-gray-500"}`}>
                      {topic.solved}/{topic.total} ({Math.round(topic.percentage)}%)
                      {isCompleted && <span className="ml-1">🎉</span>}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(topic.percentage, 100)}
                    className={`h-2 ${isCompleted ? "bg-green-100" : ""}`}
                  />
                  {isCompleted && <p className="text-xs text-green-600 font-medium">Topic completed!</p>}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Topic Filter and Daily Progress */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-medium text-gray-800">Daily Progress</CardTitle>
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {DSA_TOPICS.map((topic) => (
                  <SelectItem key={topic.name} value={topic.name}>
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {selectedTopic === "all" ? (
            <div className="space-y-3">
              {getAllDailyProgress()
                .slice(0, 10)
                .map(({ date, total }) => (
                  <div key={date} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-gray-600">{total} questions</span>
                  </div>
                ))}
              {getAllDailyProgress().length === 0 && (
                <p className="text-center text-gray-500 py-4">No active days yet. Start solving questions!</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {getTopicDailyProgress(selectedTopic)
                .slice(-10)
                .reverse()
                .map(({ date, count }) => (
                  <div key={date} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-gray-600">{count} questions</span>
                  </div>
                ))}
              {getTopicDailyProgress(selectedTopic).length === 0 && (
                <p className="text-center text-gray-500 py-4">No questions solved for {selectedTopic} yet.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Management - Pass admin mode */}
      <DataManager data={data} onDataImport={onDataImport} isAdminMode={isAdminMode} />
    </div>
  )
}

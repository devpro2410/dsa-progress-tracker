"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { DSAData } from "@/app/page"
import { DSA_TOPICS } from "@/constants"

interface CalendarProps {
  data: DSAData
  onDateClick: (date: string) => void
}

export function Calendar({ data, onDateClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const today = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const formatDate = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const getTopicsForDate = (date: string) => {
    const entry = data[date]
    if (!entry) return []

    return Object.entries(entry)
      .filter(([_, count]) => count > 0)
      .map(([topic, count]) => ({ topic, count }))
      .slice(0, 3) // Show max 3 topics
  }

  const isToday = (day: number) => {
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
  }

  const isFutureDate = (day: number) => {
    const dateToCheck = new Date(year, month, day)
    return dateToCheck > today
  }

  return (
    <Card className="p-6 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigateMonth("prev")} className="hover:bg-gray-100">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <h2 className="text-xl font-medium text-gray-800">
          {monthNames[month]} {year}
        </h2>

        <Button variant="ghost" size="sm" onClick={() => navigateMonth("next")} className="hover:bg-gray-100">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before the first day of the month */}
        {Array.from({ length: firstDayWeekday }, (_, i) => (
          <div key={`empty-${i}`} className="p-2 h-20 sm:h-24" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const dateStr = formatDate(day)
          const topicsForDate = getTopicsForDate(dateStr)
          const hasData = topicsForDate.length > 0
          const isCurrentDay = isToday(day)
          const isFuture = isFutureDate(day)

          return (
            <button
              key={day}
              onClick={() => !isFuture && onDateClick(dateStr)}
              disabled={isFuture}
              className={`
                p-1 h-20 sm:h-24 border border-gray-100 rounded-lg text-left transition-all
                hover:border-gray-300 hover:shadow-sm
                ${isCurrentDay ? "bg-blue-50 border-blue-200" : "bg-white"}
                ${hasData ? "border-green-200 bg-green-50" : ""}
                ${isFuture ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <div className="flex flex-col h-full">
                <span className={`text-sm font-medium mb-1 ${isCurrentDay ? "text-blue-600" : "text-gray-700"}`}>
                  {day}
                </span>

                <div className="flex-1 overflow-hidden">
                  {topicsForDate.map(({ topic, count }, index) => {
                    // Find the topic to check if it's completed
                    const topicData = DSA_TOPICS.find((t) => t.name === topic)
                    const totalSolved = Object.values(data).reduce((total, entry) => {
                      return total + (entry[topic] || 0)
                    }, 0)
                    const isCompleted = topicData && totalSolved >= topicData.total

                    return (
                      <div
                        key={topic}
                        className={`text-xs px-1 py-0.5 rounded mb-0.5 truncate ${
                          isCompleted ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {topic.split(" ")[0]}: {count}
                        {isCompleted && <span className="ml-1 text-green-800"> ✓</span>}
                      </div>
                    )
                  })}
                  {topicsForDate.length > 3 && <div className="text-xs text-gray-500">+more</div>}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </Card>
  )
}

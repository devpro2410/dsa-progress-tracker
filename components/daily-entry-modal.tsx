"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { type DSAEntry, DSA_TOPICS } from "@/app/page"

interface DailyEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (entry: DSAEntry) => void
  selectedDate: string | null
  existingEntry?: DSAEntry
}

export function DailyEntryModal({ isOpen, onClose, onSave, selectedDate, existingEntry }: DailyEntryModalProps) {
  const [entry, setEntry] = useState<DSAEntry>({})
  const [data, setData] = useState<Record<string, DSAEntry>>({}) // Assuming you have a way to fetch all entries

  useEffect(() => {
    if (existingEntry) {
      setEntry(existingEntry)
    } else {
      // Initialize with zeros
      const initialEntry: DSAEntry = {}
      DSA_TOPICS.forEach((topic) => {
        initialEntry[topic.name] = 0
      })
      setEntry(initialEntry)
    }
  }, [existingEntry, isOpen])

  const handleInputChange = (topicName: string, value: string) => {
    const topic = DSA_TOPICS.find((t) => t.name === topicName)
    if (!topic) return

    const numValue = Math.max(0, Number.parseInt(value) || 0)
    const clampedValue = Math.min(numValue, topic.total) // Prevent exceeding limit

    setEntry((prev) => ({
      ...prev,
      [topicName]: clampedValue,
    }))
  }

  const handleSave = () => {
    onSave(entry)
  }

  const handleClear = () => {
    const clearedEntry: DSAEntry = {}
    DSA_TOPICS.forEach((topic) => {
      clearedEntry[topic.name] = 0
    })
    setEntry(clearedEntry)
  }

  const getTotalQuestions = () => {
    return Object.values(entry).reduce((sum, count) => sum + count, 0)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg font-medium text-gray-800">Daily Progress Entry</DialogTitle>
          <p className="text-sm text-gray-600">{formatDate(selectedDate)}</p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4 pb-4">
              {DSA_TOPICS.map((topic) => {
                const currentValue = entry[topic.name] || 0
                const isCompleted = currentValue >= topic.total
                const totalSolved = Object.values(data).reduce((total, dayEntry) => {
                  return total + (dayEntry[topic.name] || 0)
                }, 0)
                const isTopicCompleted = totalSolved >= topic.total

                return (
                  <div key={topic.name} className="space-y-2">
                    <Label
                      htmlFor={topic.name}
                      className="text-sm font-medium text-gray-700 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        {topic.name}
                        {isTopicCompleted && <span className="text-green-600 text-xs">✓ Completed</span>}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({totalSolved}/{topic.total})
                      </span>
                    </Label>
                    <Input
                      id={topic.name}
                      type="number"
                      min="0"
                      max={topic.total - totalSolved + currentValue} // Allow current value but prevent exceeding total
                      value={currentValue}
                      onChange={(e) => handleInputChange(topic.name, e.target.value)}
                      className={`w-full ${isTopicCompleted ? "bg-green-50 border-green-200" : ""}`}
                      placeholder="0"
                      disabled={isTopicCompleted && currentValue === 0} // Disable if topic completed and no current entry
                    />
                    {isTopicCompleted && <p className="text-xs text-green-600">This topic is completed! 🎉</p>}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        <div className="border-t pt-4 space-y-4 flex-shrink-0">
          <div className="text-center">
            <span className="text-sm text-gray-600">
              Total questions: <span className="font-medium">{getTotalQuestions()}</span>
            </span>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClear} className="flex-1">
              Clear All
            </Button>
            <Button onClick={handleSave} className="flex-1 bg-gray-800 hover:bg-gray-700">
              Save Entry
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

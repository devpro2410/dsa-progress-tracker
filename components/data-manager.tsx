"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Download, Upload, Trash2 } from "lucide-react"
import type { DSAData } from "@/app/page"

interface DataManagerProps {
  data: DSAData
  onDataImport: (data: DSAData) => void
  isAdminMode?: boolean // Add admin mode prop
}

export function DataManager({ data, onDataImport, isAdminMode = false }: DataManagerProps) {
  const [importError, setImportError] = useState<string | null>(null)

  const handleExport = () => {
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `dsa-progress-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)
        onDataImport(importedData)
        setImportError(null)
      } catch (error) {
        setImportError("Invalid file format. Please select a valid JSON file.")
      }
    }
    reader.readAsText(file)
  }

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all your progress data? This action cannot be undone.")) {
      onDataImport({})
    }
  }

  const totalEntries = Object.keys(data).length
  const totalQuestions = Object.values(data).reduce((total, entry) => {
    return total + Object.values(entry).reduce((sum, count) => sum + count, 0)
  }, 0)

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-800">Data Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="font-medium text-gray-800">{totalEntries}</div>
            <div className="text-gray-600">Days tracked</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="font-medium text-gray-800">{totalQuestions}</div>
            <div className="text-gray-600">Total questions</div>
          </div>
        </div>

        <div className="space-y-3">
          <Button onClick={handleExport} className="w-full flex items-center gap-2" variant="outline">
            <Download className="h-4 w-4" />
            Export Data
          </Button>

          {isAdminMode && (
            <>
              <div className="relative">
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button className="w-full flex items-center gap-2" variant="outline">
                  <Upload className="h-4 w-4" />
                  Import Data
                </Button>
              </div>

              {importError && <p className="text-sm text-red-500">{importError}</p>}

              <Button onClick={handleClearData} className="w-full flex items-center gap-2" variant="outline" size="sm">
                <Trash2 className="h-4 w-4" />
                Clear All Data
              </Button>
            </>
          )}

          {!isAdminMode && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">Additional data management options available in admin mode</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

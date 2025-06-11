"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, LogOut } from "lucide-react"

interface AdminPanelProps {
  isAdminMode: boolean
  onToggleAdminMode: () => void
  onAuthenticateAdmin: () => void
}

export function AdminPanel({ isAdminMode, onToggleAdminMode, onAuthenticateAdmin }: AdminPanelProps) {
  const [password, setPassword] = useState("")
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/verify")
        const data = await response.json()

        if (data.authenticated) {
          onAuthenticateAdmin()
        }
      } catch (error) {
        console.error("Session verification error:", error)
      }
    }

    checkSession()
  }, [onAuthenticateAdmin])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (data.success) {
        onAuthenticateAdmin()
        setPassword("")
        setShowPasswordInput(false)
      } else {
        setError("Invalid password")
      }
    } catch (error) {
      setError("Authentication failed")
      console.error("Authentication error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    setIsLoading(true)

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
      onToggleAdminMode()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isAdminMode) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-700 font-medium">Admin Mode</span>
              <Button variant="ghost" size="sm" onClick={handleLogout} disabled={isLoading}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {!showPasswordInput ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPasswordInput(true)}
          className="bg-white/80 backdrop-blur-sm border border-gray-200"
        >
          <Settings className="h-4 w-4" />
        </Button>
      ) : (
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-2">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-8 text-sm"
                autoFocus
                disabled={isLoading}
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <div className="flex gap-1">
                <Button type="submit" size="sm" className="h-7 text-xs" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Login"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPasswordInput(false)}
                  className="h-7 text-xs"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { ManualDataForm } from '@/components/sections/ManualDataForm'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Check if auth cookie exists by making a test request
    fetch('/api/admin-auth/check')
      .then((res) => {
        if (res.ok) setAuthed(true)
      })
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        setAuthed(true)
      } else {
        const { error: errMsg } = await res.json()
        setError(errMsg ?? 'Login failed')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  if (checking) return null

  if (!authed) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="bg-bg-surface border border-border-subtle rounded-card p-8 w-full max-w-sm">
          <h1 className="text-xl font-sans font-semibold text-text-primary mb-2">Admin Access</h1>
          <p className="text-sm text-text-muted mb-6">Enter the admin password to continue.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-bg-elevated border border-border-subtle rounded-badge px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
            />
            {error && <p className="text-sm text-status-down">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent-primary text-bg-base font-semibold text-sm rounded-badge hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Checking...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-sans font-semibold text-text-primary">Manual Data Entry</h1>
            <p className="text-sm text-text-muted mt-1">Log installer inquiries and survey responses</p>
          </div>
          <a
            href="/"
            className="text-sm text-text-muted hover:text-text-primary transition-colors border border-border-subtle rounded-badge px-3 py-1.5"
          >
            &larr; Dashboard
          </a>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-card p-6">
          <ManualDataForm />
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

interface FormState {
  entry_date: string
  installer_inquiries: number
  survey_social: number
  survey_google: number
  survey_word_of_mouth: number
  survey_installer_referral: number
  survey_other: number
  notes: string
}

const DEFAULT_STATE: FormState = {
  entry_date: new Date().toISOString().split('T')[0],
  installer_inquiries: 0,
  survey_social: 0,
  survey_google: 0,
  survey_word_of_mouth: 0,
  survey_installer_referral: 0,
  survey_other: 0,
  notes: '',
}

function NumberField({
  label,
  name,
  value,
  onChange,
}: {
  label: string
  name: string
  value: number
  onChange: (name: string, val: number) => void
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-text-muted mb-1.5">
        {label}
      </label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(name, parseInt(e.target.value || '0', 10))}
        className="w-full bg-bg-elevated border border-border-subtle rounded-badge px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
      />
    </div>
  )
}

export function ManualDataForm() {
  const [form, setForm] = useState<FormState>(DEFAULT_STATE)
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function handleChange(name: string, val: number | string) {
    setForm((prev) => ({ ...prev, [name]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving')
    setErrorMsg('')

    try {
      const res = await fetch('/api/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error ?? 'Unknown error')
      }
      setStatus('success')
      setForm(DEFAULT_STATE)
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-xs uppercase tracking-wider text-text-muted mb-1.5">
          Date
        </label>
        <input
          type="date"
          value={form.entry_date}
          onChange={(e) => handleChange('entry_date', e.target.value)}
          required
          className="w-full bg-bg-elevated border border-border-subtle rounded-badge px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
        />
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-text-muted mb-3">Installer Inquiries</p>
        <NumberField
          label="Number of inquiries"
          name="installer_inquiries"
          value={form.installer_inquiries}
          onChange={handleChange}
        />
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-text-muted mb-3">
          How Did You Hear About Us — Survey Responses
        </p>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Social Media" name="survey_social" value={form.survey_social} onChange={handleChange} />
          <NumberField label="Google Search" name="survey_google" value={form.survey_google} onChange={handleChange} />
          <NumberField label="Word of Mouth" name="survey_word_of_mouth" value={form.survey_word_of_mouth} onChange={handleChange} />
          <NumberField label="Installer Referral" name="survey_installer_referral" value={form.survey_installer_referral} onChange={handleChange} />
          <NumberField label="Other" name="survey_other" value={form.survey_other} onChange={handleChange} />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-text-muted mb-1.5">
          Notes (optional)
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
          className="w-full bg-bg-elevated border border-border-subtle rounded-badge px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary transition-colors resize-none"
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-status-down">{errorMsg}</p>
      )}
      {status === 'success' && (
        <p className="text-sm text-status-up">Entry saved successfully.</p>
      )}

      <button
        type="submit"
        disabled={status === 'saving'}
        className="w-full py-2.5 px-4 bg-accent-primary text-bg-base font-sans font-semibold text-sm rounded-badge hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {status === 'saving' ? 'Saving...' : 'Save Entry'}
      </button>
    </form>
  )
}

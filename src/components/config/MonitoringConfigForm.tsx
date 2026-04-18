'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { isValidCronExpression } from '@/lib/utils/cron'

const PRESETS = [
  { label: 'Diaria (08:00)', value: '0 8 * * *' },
  { label: 'Semanal (lunes 08:00)', value: '0 8 * * 1' },
  { label: 'Mensual (día 1, 08:00)', value: '0 8 1 * *' },
  { label: 'Personalizada', value: 'custom' },
]

interface MonitoringConfig {
  id: string
  cronExpression: string
  timezone: string
}

export function MonitoringConfigForm() {
  const [config, setConfig] = useState<MonitoringConfig | null>(null)
  const [preset, setPreset] = useState('custom')
  const [customCron, setCustomCron] = useState('')
  const [cronError, setCronError] = useState('')
  const [saving, setSaving] = useState(false)
  const [runningNow, setRunningNow] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/monitoring-config')
      .then((r) => r.json())
      .then((data: MonitoringConfig) => {
        setConfig(data)
        const matched = PRESETS.find(
          (p) => p.value !== 'custom' && p.value === data.cronExpression
        )
        if (matched) {
          setPreset(matched.value)
        } else {
          setPreset('custom')
          setCustomCron(data.cronExpression)
        }
      })
      .catch(() => {})
  }, [])

  function handlePresetChange(value: string | null) {
    if (!value) return
    setPreset(value)
    if (value !== 'custom') setCustomCron(value)
    setCronError('')
  }

  function handleCustomChange(value: string) {
    setCustomCron(value)
    if (value && !isValidCronExpression(value)) {
      setCronError('Expresión cron inválida (formato: minuto hora día mes día-semana)')
    } else {
      setCronError('')
    }
  }

  const effectiveCron = preset === 'custom' ? customCron : preset

  async function handleSave() {
    if (!isValidCronExpression(effectiveCron)) {
      setCronError('Expresión cron inválida')
      return
    }
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/monitoring-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cronExpression: effectiveCron }),
      })
      if (res.ok) {
        setMessage('✓ Configuración guardada correctamente')
      } else {
        const data = await res.json()
        setMessage(`Error: ${data.error}`)
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleRunNow() {
    setRunningNow(true)
    setMessage('')
    try {
      const res = await fetch('/api/cron/run', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? ''}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        setMessage(
          `✓ Ejecución completada: ${data.successful} exitosos, ${data.failed} fallidos`
        )
      } else {
        setMessage('Error al ejecutar el relevamiento')
      }
    } finally {
      setRunningNow(false)
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div className="space-y-1">
        <Label>Frecuencia de monitoreo</Label>
        <Select value={preset} onValueChange={handlePresetChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRESETS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {preset === 'custom' && (
        <div className="space-y-1">
          <Label htmlFor="cron">Expresión cron personalizada</Label>
          <Input
            id="cron"
            value={customCron}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder="0 8 * * *"
            className="font-mono"
          />
          {cronError && (
            <p className="text-xs text-destructive">{cronError}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Formato: minuto hora día-mes mes día-semana
          </p>
        </div>
      )}

      <div className="space-y-1 text-sm text-muted-foreground">
        <p>
          Zona horaria:{' '}
          <span className="font-mono">{config?.timezone ?? 'America/La_Paz'}</span>
        </p>
        <p>
          Expresión activa:{' '}
          <span className="font-mono">{config?.cronExpression ?? '—'}</span>
        </p>
      </div>

      {message && (
        <p
          className={`text-sm ${message.startsWith('Error') ? 'text-destructive' : 'text-green-600'}`}
        >
          {message}
        </p>
      )}

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving || !!cronError}>
          {saving ? 'Guardando...' : 'Guardar configuración'}
        </Button>
        <Button variant="outline" onClick={handleRunNow} disabled={runningNow}>
          {runningNow ? 'Ejecutando...' : 'Ejecutar ahora'}
        </Button>
      </div>
    </div>
  )
}

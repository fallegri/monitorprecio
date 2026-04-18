'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

const DEPARTMENTS = [
  { code: 'SCZ', name: 'Santa Cruz' },
  { code: 'LPZ', name: 'La Paz' },
  { code: 'CBB', name: 'Cochabamba' },
  { code: 'ORU', name: 'Oruro' },
  { code: 'POT', name: 'Potosí' },
  { code: 'CHU', name: 'Chuquisaca' },
  { code: 'TJA', name: 'Tarija' },
  { code: 'BEN', name: 'Beni' },
  { code: 'PAN', name: 'Pando' },
]

const LINE_COLORS = [
  '#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed',
  '#0891b2', '#be185d', '#65a30d', '#ea580c',
]

interface PriceLogEntry {
  id: number
  productId: string
  departmentId: string
  price: string
  sourceName: string
  timestamp: string
}

interface ChartDataPoint {
  time: string
  [deptCode: string]: string | number
}

interface PriceTrendChartProps {
  productId: string
  productName: string
}

export function PriceTrendChart({ productId, productName }: PriceTrendChartProps) {
  const [selectedDepts, setSelectedDepts] = useState<string[]>(['SCZ'])
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [hasData, setHasData] = useState(true)

  useEffect(() => {
    if (!productId) return
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, selectedDepts, from, to])

  async function fetchData() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ productId, limit: '200' })
      if (from) params.set('from', new Date(from).toISOString())
      if (to) params.set('to', new Date(to).toISOString())

      const res = await fetch(`/api/price-logs?${params.toString()}`)
      if (!res.ok) return

      const logs: PriceLogEntry[] = await res.json()

      if (logs.length === 0) {
        setHasData(false)
        setChartData([])
        return
      }

      setHasData(true)

      // Group by timestamp → dept
      const byTime = new Map<string, ChartDataPoint>()
      for (const log of logs) {
        const dept = DEPARTMENTS.find((d) => d.code === log.departmentId)
        if (!dept || !selectedDepts.includes(dept.code)) continue

        const time = new Date(log.timestamp).toLocaleDateString('es-BO')
        if (!byTime.has(time)) byTime.set(time, { time })
        byTime.get(time)![dept.code] = parseFloat(log.price)
      }

      setChartData(Array.from(byTime.values()))
    } finally {
      setLoading(false)
    }
  }

  function toggleDept(code: string) {
    setSelectedDepts((prev) =>
      prev.includes(code) ? prev.filter((d) => d !== code) : [...prev, code]
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{productName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <Label className="text-xs">Desde</Label>
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-36 h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Hasta</Label>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-36 h-8 text-sm"
            />
          </div>
        </div>

        {/* Department selector */}
        <div className="flex flex-wrap gap-1">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept.code}
              type="button"
              onClick={() => toggleDept(dept.code)}
              className="focus:outline-none"
            >
              <Badge
                variant={selectedDepts.includes(dept.code) ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
              >
                {dept.code}
              </Badge>
            </button>
          ))}
        </div>

        {/* Chart */}
        {loading ? (
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
            Cargando datos...
          </div>
        ) : !hasData || chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground border rounded-md">
            No hay registros de precio para el período seleccionado.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              {selectedDepts.map((code, i) => (
                <Line
                  key={code}
                  type="monotone"
                  dataKey={code}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]}
                  dot={false}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

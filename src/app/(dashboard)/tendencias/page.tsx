'use client'

import { useState, useEffect } from 'react'
import { PriceTrendChart } from '@/components/charts/PriceTrendChart'
import { PriceSummaryCard } from '@/components/charts/PriceSummaryCard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Product {
  id: string
  name: string
  unit: string
  category: string
  isActive: boolean
}

export default function TendenciasPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products?isActive=true')
      .then((r) => r.json())
      .then((data: Product[]) => {
        setProducts(data)
        if (data.length > 0) setSelectedId(data[0].id)
      })
      .finally(() => setLoading(false))
  }, [])

  const selected = products.find((p) => p.id === selectedId)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tendencias de Precios</h2>
        <p className="text-muted-foreground mt-1">
          Evolución histórica por producto y departamento
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando productos...</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay productos activos. Agrega productos en la sección de Productos.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Producto:</span>
            <Select value={selectedId} onValueChange={(v) => v && setSelectedId(v)}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selected && (
            <div className="space-y-4">
              <PriceSummaryCard
                productName={selected.name}
                lastPrice={null}
                previousPrice={null}
                sourceName={null}
                unit={selected.unit}
              />
              <PriceTrendChart
                productId={selected.id}
                productName={selected.name}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

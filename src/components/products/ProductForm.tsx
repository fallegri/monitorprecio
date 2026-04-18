'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Badge } from '@/components/ui/badge'
import type { ProductWithDepts } from './ProductTable'

const CATEGORIES = ['Alimentos', 'Divisas', 'Demografía'] as const

const DEPARTMENTS = [
  { id: '', code: 'SCZ', name: 'Santa Cruz' },
  { id: '', code: 'LPZ', name: 'La Paz' },
  { id: '', code: 'CBB', name: 'Cochabamba' },
  { id: '', code: 'ORU', name: 'Oruro' },
  { id: '', code: 'POT', name: 'Potosí' },
  { id: '', code: 'CHU', name: 'Chuquisaca' },
  { id: '', code: 'TJA', name: 'Tarija' },
  { id: '', code: 'BEN', name: 'Beni' },
  { id: '', code: 'PAN', name: 'Pando' },
]

interface ProductFormProps {
  open: boolean
  product?: ProductWithDepts | null
  departmentOptions: Array<{ id: string; name: string; code: string }>
  onClose: () => void
  onSaved: () => void
}

interface FormErrors {
  name?: string
  unit?: string
  category?: string
  departmentIds?: string
  general?: string
}

export function ProductForm({
  open,
  product,
  departmentOptions,
  onClose,
  onSaved,
}: ProductFormProps) {
  const isEditing = !!product

  const [name, setName] = useState(product?.name ?? '')
  const [unit, setUnit] = useState(product?.unit ?? '')
  const [category, setCategory] = useState<string | null>(product?.category ?? null)
  const [selectedDeptIds, setSelectedDeptIds] = useState<string[]>(
    product?.departments.map((d) => d.id) ?? []
  )
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  const depts =
    departmentOptions.length > 0
      ? departmentOptions
      : DEPARTMENTS.map((d) => ({ ...d, id: d.code }))

  function validate(): boolean {
    const newErrors: FormErrors = {}
    if (!name.trim()) newErrors.name = 'El nombre es requerido'
    if (!unit.trim()) newErrors.unit = 'La unidad es requerida'
    if (!category) newErrors.category = 'La categoría es requerida'
    if (selectedDeptIds.length === 0)
      newErrors.departmentIds = 'Selecciona al menos un departamento'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function toggleDept(id: string) {
    setSelectedDeptIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const payload = {
        name: name.trim(),
        unit: unit.trim(),
        category: category ?? '',
        departmentIds: selectedDeptIds,
      }

      const url = isEditing
        ? `/api/products/${product!.id}`
        : '/api/products'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        setErrors({ general: data.error ?? 'Error al guardar el producto' })
        return
      }

      onSaved()
      onClose()
    } catch {
      setErrors({ general: 'Error de conexión. Intente nuevamente.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar producto' : 'Nuevo producto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <p className="text-sm text-destructive">{errors.general}</p>
          )}

          <div className="space-y-1">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej. Carne de Pollo"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="unit">Unidad</Label>
            <Input
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="ej. kg, 1L, unidad"
            />
            {errors.unit && (
              <p className="text-xs text-destructive">{errors.unit}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Categoría</Label>
            <Select value={category ?? ''} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Departamentos</Label>
            <div className="flex flex-wrap gap-2">
              {depts.map((dept) => (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => toggleDept(dept.id)}
                  className="focus:outline-none"
                >
                  <Badge
                    variant={
                      selectedDeptIds.includes(dept.id) ? 'default' : 'outline'
                    }
                    className="cursor-pointer"
                  >
                    {dept.code}
                  </Badge>
                </button>
              ))}
            </div>
            {errors.departmentIds && (
              <p className="text-xs text-destructive">{errors.departmentIds}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

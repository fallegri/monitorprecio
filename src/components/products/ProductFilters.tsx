'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const CATEGORIES = ['Alimentos', 'Divisas', 'Demografía'] as const

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

interface ProductFiltersProps {
  category: string
  departmentCode: string
  onCategoryChange: (value: string | null) => void
  onDepartmentChange: (value: string | null) => void
}

export function ProductFilters({
  category,
  departmentCode,
  onCategoryChange,
  onDepartmentChange,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Todas las categorías" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las categorías</SelectItem>
          {CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={departmentCode} onValueChange={onDepartmentChange}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Todos los departamentos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los departamentos</SelectItem>
          {DEPARTMENTS.map((dept) => (
            <SelectItem key={dept.code} value={dept.code}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export interface ProductWithDepts {
  id: string
  name: string
  unit: string
  category: 'Alimentos' | 'Divisas' | 'Demografía'
  isActive: boolean
  departments: Array<{ id: string; name: string; code: string }>
}

interface ProductTableProps {
  products: ProductWithDepts[]
  onEdit: (product: ProductWithDepts) => void
  onToggleActive: (product: ProductWithDepts) => void
}

const CATEGORY_COLORS: Record<string, 'default' | 'secondary' | 'outline'> = {
  Alimentos: 'default',
  Divisas: 'secondary',
  Demografía: 'outline',
}

export function ProductTable({
  products,
  onEdit,
  onToggleActive,
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
        No se encontraron productos con los filtros seleccionados.
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Unidad</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Departamentos</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {product.unit}
              </TableCell>
              <TableCell>
                <Badge variant={CATEGORY_COLORS[product.category] ?? 'outline'}>
                  {product.category}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {product.departments.map((d) => (
                    <Badge key={d.id} variant="outline" className="text-xs">
                      {d.code}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={product.isActive ? 'default' : 'secondary'}>
                  {product.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(product)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant={product.isActive ? 'secondary' : 'default'}
                    onClick={() => onToggleActive(product)}
                  >
                    {product.isActive ? 'Desactivar' : 'Activar'}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

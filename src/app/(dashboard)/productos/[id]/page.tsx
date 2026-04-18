import { notFound } from 'next/navigation'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

async function getProduct(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/products/${id}`, {
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json()
}

export default async function ProductDetailPage(
  props: PageProps<'/productos/[id]'>
) {
  const { id } = await props.params
  const product = await getProduct(id)

  if (!product) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/productos" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
          ← Volver
        </Link>
        <h2 className="text-2xl font-bold tracking-tight">{product.name}</h2>
        <Badge variant={product.isActive ? 'default' : 'secondary'}>
          {product.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalles del producto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-2">
            <span className="text-muted-foreground w-28">Unidad:</span>
            <span>{product.unit}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground w-28">Categoría:</span>
            <Badge variant="outline">{product.category}</Badge>
          </div>
          <div className="flex gap-2 items-start">
            <span className="text-muted-foreground w-28">Departamentos:</span>
            <div className="flex flex-wrap gap-1">
              {product.departments.map(
                (d: { id: string; name: string; code: string }) => (
                  <Badge key={d.id} variant="outline">
                    {d.name} ({d.code})
                  </Badge>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

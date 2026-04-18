import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Panel Principal</h2>
        <p className="text-muted-foreground mt-1">
          Monitoreo de precios de la canasta básica en Bolivia
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Departamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">9</p>
            <p className="text-xs text-muted-foreground mt-1">Bolivia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categorías
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1 flex-wrap mt-1">
              <Badge variant="secondary">Alimentos</Badge>
              <Badge variant="secondary">Divisas</Badge>
              <Badge variant="secondary">Demografía</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Frecuencia por defecto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono">0 8 * * *</p>
            <p className="text-xs text-muted-foreground mt-1">
              Diario a las 08:00 (America/La_Paz)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick access */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tendencias de Precios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Visualiza gráficos de evolución de precios por producto y
              departamento.
            </p>
            <Link href="/tendencias" className={cn(buttonVariants({ size: 'sm' }))}>
              Ver tendencias
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configuración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ajusta la frecuencia de relevamiento y gestiona los parámetros del
              sistema.
            </p>
            <Link href="/configuracion" className={cn(buttonVariants({ size: 'sm', variant: 'outline' }))}>
              Ir a configuración
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

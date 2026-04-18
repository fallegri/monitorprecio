import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PriceSummaryCardProps {
  productName: string
  lastPrice: number | null
  previousPrice: number | null
  sourceName: string | null
  unit: string
}

function formatPrice(price: number, unit: string) {
  return `Bs. ${price.toFixed(2)} / ${unit}`
}

function calcVariation(current: number, previous: number): number {
  return ((current - previous) / previous) * 100
}

export function PriceSummaryCard({
  productName,
  lastPrice,
  previousPrice,
  sourceName,
  unit,
}: PriceSummaryCardProps) {
  const variation =
    lastPrice !== null && previousPrice !== null
      ? calcVariation(lastPrice, previousPrice)
      : null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{productName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {lastPrice !== null ? (
          <>
            <p className="text-xl font-bold">{formatPrice(lastPrice, unit)}</p>
            {variation !== null && (
              <Badge
                variant={
                  variation > 0
                    ? 'destructive'
                    : variation < 0
                      ? 'default'
                      : 'secondary'
                }
                className="text-xs"
              >
                {variation > 0 ? '▲' : variation < 0 ? '▼' : '—'}{' '}
                {Math.abs(variation).toFixed(2)}%
              </Badge>
            )}
            {sourceName && (
              <p className="text-xs text-muted-foreground">
                Fuente: {sourceName}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Sin datos disponibles</p>
        )}
      </CardContent>
    </Card>
  )
}

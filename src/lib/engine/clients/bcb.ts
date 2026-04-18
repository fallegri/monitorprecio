import { PriceRecordSchema, type PriceRecord } from '../parser'
import type { RestApiAdapter } from './base'

interface BcbApiResponse {
  moneda: string
  tipo_cambio_compra: string
  tipo_cambio_venta: string
  fecha: string
}

export class BcbApiClient implements RestApiAdapter {
  readonly sourceName = 'Banco Central de Bolivia'
  readonly sourceUrl = 'https://www.bcb.gob.bo'

  async fetch(productCode: string, departmentCode: string): Promise<PriceRecord> {
    // BCB API for exchange rates (USD/BOB, EUR/BOB, etc.)
    // Endpoint: https://www.bcb.gob.bo/librerias/api/v1/tipo_cambio
    const url = `${this.sourceUrl}/librerias/api/v1/tipo_cambio?moneda=${productCode}`

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'MonitorPreciosSCZ/1.0',
      },
    })

    if (!response.ok) {
      throw new Error(
        `BCB API HTTP ${response.status} para ${productCode}/${departmentCode}`
      )
    }

    const data: BcbApiResponse = await response.json()

    if (!data.tipo_cambio_venta) {
      throw new Error(
        `BCB API no retornó tipo_cambio_venta para ${productCode}`
      )
    }

    const price = parseFloat(data.tipo_cambio_venta)
    if (isNaN(price)) {
      throw new Error(`BCB API retornó precio inválido: ${data.tipo_cambio_venta}`)
    }

    return PriceRecordSchema.parse({
      productId: productCode,
      departmentId: departmentCode,
      price,
      sourceName: this.sourceName,
      sourceUrl: url,
      observations: `Tipo de cambio venta ${data.moneda} - ${data.fecha}`,
      timestamp: new Date().toISOString(),
    })
  }
}

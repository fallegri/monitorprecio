import { PriceRecordSchema, type PriceRecord } from '../parser'
import type { RestApiAdapter } from './base'
import { searchPrice, DEPARTMENT_NAMES } from '../search/serpapi'

export class SerpApiSearchClient implements RestApiAdapter {
  readonly sourceName = 'SerpAPI (Google Search)'
  readonly sourceUrl = 'https://serpapi.com'

  private productName: string
  private departmentCode: string

  constructor(productName: string, departmentCode: string) {
    this.productName = productName
    this.departmentCode = departmentCode
  }

  async fetch(productId: string, departmentId: string): Promise<PriceRecord> {
    const departmentName =
      DEPARTMENT_NAMES[this.departmentCode] ?? this.departmentCode

    const result = await searchPrice(
      this.productName,
      departmentName,
      this.departmentCode
    )

    if (!result) {
      throw new Error(
        `No se encontró precio para "${this.productName}" en ${departmentName}`
      )
    }

    return PriceRecordSchema.parse({
      productId,
      departmentId,
      price: result.price,
      sourceName: result.sourceName,
      sourceUrl: result.sourceUrl,
      observations: result.observations,
      timestamp: new Date().toISOString(),
    })
  }
}

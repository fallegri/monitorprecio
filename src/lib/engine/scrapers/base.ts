import type { PriceRecord } from '../parser'

export interface ScraperAdapter {
  readonly sourceName: string
  readonly sourceUrl: string
  fetch(productCode: string, departmentCode: string): Promise<PriceRecord>
}

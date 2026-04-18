import type { PriceRecord } from '../parser'

export interface RestApiAdapter {
  readonly sourceName: string
  readonly sourceUrl: string
  fetch(productCode: string, departmentCode: string): Promise<PriceRecord>
}

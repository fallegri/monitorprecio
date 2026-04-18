import * as cheerio from 'cheerio'
import { PriceRecordSchema, type PriceRecord } from '../parser'
import type { ScraperAdapter } from './base'

export class ElDeberScraper implements ScraperAdapter {
  readonly sourceName = 'El Deber'
  readonly sourceUrl = 'https://eldeber.com.bo'

  async fetch(productCode: string, departmentCode: string): Promise<PriceRecord> {
    // NOTE: This is a stub implementation.
    // Real scraping logic should target the actual El Deber portal structure.
    // Replace the URL and selectors once the target page is identified.
    const url = `${this.sourceUrl}/economia/precios/${productCode}?dept=${departmentCode}`

    const response = await fetch(url, {
      headers: { 'User-Agent': 'MonitorPreciosSCZ/1.0' },
    })

    if (!response.ok) {
      throw new Error(
        `El Deber HTTP ${response.status} para ${productCode}/${departmentCode}`
      )
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // TODO: Update selector to match actual El Deber page structure
    const priceText = $('[data-precio]').first().attr('data-precio') ?? ''
    const price = parseFloat(priceText)

    if (isNaN(price)) {
      throw new Error(
        `No se pudo extraer el precio de El Deber para ${productCode}/${departmentCode}`
      )
    }

    return PriceRecordSchema.parse({
      productId: productCode,
      departmentId: departmentCode,
      price,
      sourceName: this.sourceName,
      sourceUrl: url,
      timestamp: new Date().toISOString(),
    })
  }
}

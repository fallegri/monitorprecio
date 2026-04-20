/**
 * SerpAPI-based price search.
 * Searches Google for a product price in a specific department of Bolivia,
 * then extracts the price from the search results using regex.
 */

interface SerpApiOrganicResult {
  title: string
  link: string
  snippet: string
  displayed_link?: string
}

interface SerpApiResponse {
  organic_results?: SerpApiOrganicResult[]
  answer_box?: {
    answer?: string
    snippet?: string
    title?: string
  }
  error?: string
}

export interface SearchPriceResult {
  price: number
  sourceName: string
  sourceUrl: string
  observations: string
}

// Regex patterns to extract prices in Bolivianos or USD
const PRICE_PATTERNS = [
  // "Bs. 12.50", "Bs 12,50", "BS 12.50"
  /[Bb][Ss]\.?\s*(\d{1,6}[.,]\d{1,2})/,
  // "12.50 Bs", "12,50 bs"
  /(\d{1,6}[.,]\d{1,2})\s*[Bb][Ss]/,
  // "$us 12.50", "USD 12.50"
  /(?:\$us|USD|usd)\s*(\d{1,6}[.,]\d{1,2})/i,
  // "precio: 12.50", "costo: 12,50"
  /(?:precio|costo|valor|price)[:\s]+(\d{1,6}[.,]\d{1,2})/i,
  // Plain number with decimal: "12.50" or "12,50" (last resort)
  /\b(\d{1,4}[.,]\d{2})\b/,
]

function extractPrice(text: string): number | null {
  for (const pattern of PRICE_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      const raw = match[1].replace(',', '.')
      const value = parseFloat(raw)
      if (!isNaN(value) && value > 0 && value < 100000) {
        return value
      }
    }
  }
  return null
}

function buildQuery(productName: string, departmentName: string): string {
  return `precio "${productName}" ${departmentName} Bolivia 2026 Bs`
}

export async function searchPrice(
  productName: string,
  departmentName: string,
  departmentCode: string
): Promise<SearchPriceResult | null> {
  const apiKey = process.env.SERPAPI_KEY
  if (!apiKey) throw new Error('SERPAPI_KEY no configurada')

  const query = buildQuery(productName, departmentName)
  const params = new URLSearchParams({
    api_key: apiKey,
    engine: 'google',
    q: query,
    gl: 'bo',       // Bolivia
    hl: 'es',       // Spanish
    num: '5',
    safe: 'active',
  })

  const url = `https://serpapi.com/search.json?${params.toString()}`
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`SerpAPI HTTP ${res.status}: ${res.statusText}`)
  }

  const data: SerpApiResponse = await res.json()

  if (data.error) {
    throw new Error(`SerpAPI error: ${data.error}`)
  }

  // Try answer box first (most reliable)
  if (data.answer_box) {
    const boxText = [
      data.answer_box.answer,
      data.answer_box.snippet,
      data.answer_box.title,
    ]
      .filter(Boolean)
      .join(' ')

    const price = extractPrice(boxText)
    if (price) {
      return {
        price,
        sourceName: 'Google Answer Box',
        sourceUrl: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        observations: `Búsqueda: "${query}" | Fuente: answer box`,
      }
    }
  }

  // Try organic results
  const results = data.organic_results ?? []
  for (const result of results) {
    const text = `${result.title} ${result.snippet}`
    const price = extractPrice(text)
    if (price) {
      return {
        price,
        sourceName: result.displayed_link ?? new URL(result.link).hostname,
        sourceUrl: result.link,
        observations: `Búsqueda: "${query}" | Snippet: ${result.snippet.slice(0, 120)}`,
      }
    }
  }

  return null
}

// Map department codes to Spanish names for better search results
export const DEPARTMENT_NAMES: Record<string, string> = {
  SCZ: 'Santa Cruz',
  LPZ: 'La Paz',
  CBB: 'Cochabamba',
  ORU: 'Oruro',
  POT: 'Potosí',
  CHU: 'Sucre',
  TJA: 'Tarija',
  BEN: 'Trinidad',
  PAN: 'Cobija',
}

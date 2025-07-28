interface PDFParseOptions {
  method?: 'auto' | 'pdf-parse'
  maxPages?: number
}

interface PDFParseResult {
  text: string
  pages: number
  success: boolean
  error?: string
}

export async function parsePDFFile(file: File, options: PDFParseOptions = {}): Promise<PDFParseResult> {
  const { method = 'auto', maxPages = 50 } = options

  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Try pdf-parse method
    if (method === 'auto' || method === 'pdf-parse') {
      try {
        // Dynamic import to avoid bundling issues
        const pdf = await import('pdf-parse')
        const result = await pdf.default(buffer, {
          max: maxPages
        })

        return {
          text: result.text,
          pages: result.numpages,
          success: true
        }
      } catch (pdfParseError) {
        console.error('pdf-parse failed:', pdfParseError)
        
        // Return error details for debugging
        return {
          text: '',
          pages: 0,
          success: false,
          error: `PDF parsing failed: ${pdfParseError instanceof Error ? pdfParseError.message : 'Unknown error'}`
        }
      }
    }

    throw new Error('No valid parsing method available')

  } catch (error) {
    console.error('PDF parsing error:', error)
    return {
      text: '',
      pages: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown parsing error'
    }
  }
}

export function isPDFFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

export function isTextFile(file: File): boolean {
  return file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')
}
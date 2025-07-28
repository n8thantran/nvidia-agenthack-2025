import { NextRequest, NextResponse } from 'next/server'
import { parsePDFFile, isPDFFile, isTextFile } from '@/lib/pdfParser'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const fileContents = await Promise.all(
      files.map(async (file) => {
        if (isTextFile(file)) {
          try {
            const text = await file.text()
            return `[Text File: ${file.name}]\n${text}`
          } catch (error) {
            console.error('Text file parsing error:', error)
            return `[Text File: ${file.name} - Error reading file]`
          }
        } else if (isPDFFile(file)) {
          const result = await parsePDFFile(file, { maxPages: 50 })
          
          if (result.success) {
            return `[PDF: ${file.name} - ${result.pages} pages]\n${result.text}`
          } else {
            console.error('PDF parsing failed:', result.error)
            return `[PDF: ${file.name} - Error: ${result.error}]`
          }
        } else {
          return `[File: ${file.name} - Unsupported file type: ${file.type}]`
        }
      })
    )

    return NextResponse.json({ 
      fileContents,
      processedFiles: files.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Upload API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process files',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import pdf from 'pdf-parse'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const fileContents = await Promise.all(
      files.map(async (file) => {
        if (file.type === 'text/plain') {
          const text = await file.text()
          return `[Text File: ${file.name}]\n${text}`
        } else if (file.type === 'application/pdf') {
          try {
            const arrayBuffer = await file.arrayBuffer()
            const pdfData = Buffer.from(arrayBuffer)
            const result = await pdf(pdfData)
            return `[PDF: ${file.name}]\n${result.text}`
          } catch (error) {
            console.error('PDF parsing error:', error)
            return `[PDF: ${file.name} - Error parsing file]`
          }
        } else {
          return `[File: ${file.name} - Unsupported file type]`
        }
      })
    )

    return NextResponse.json({ fileContents })
  } catch (error) {
    console.error('Upload API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process files' },
      { status: 500 }
    )
  }
} 
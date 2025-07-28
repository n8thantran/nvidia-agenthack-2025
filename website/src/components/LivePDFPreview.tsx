'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { YCSafePDFGenerator, type SafeFormData } from '@/lib/pdfGenerator'
import { Loader2, FileText, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Dynamically import react-pdf to avoid SSR issues
const Document = dynamic(
  () => import('react-pdf').then((mod) => mod.Document),
  { ssr: false }
)

const Page = dynamic(
  () => import('react-pdf').then((mod) => mod.Page),
  { ssr: false }
)

// Set up PDF.js worker only on client side
if (typeof window !== 'undefined') {
  import('react-pdf').then((pdfjs) => {
    pdfjs.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.pdfjs.version}/build/pdf.worker.min.js`
  })
}

interface LivePDFPreviewProps {
  formData: SafeFormData
  isGenerating?: boolean
}

export function LivePDFPreview({ formData, isGenerating = false }: LivePDFPreviewProps) {
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(0.8)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Debounced PDF generation
  useEffect(() => {
    if (!isClient) return // Only run on client side

    const generatePDF = async () => {
      if (isGenerating) return // Don't update while user is generating final document
      
      setIsLoading(true)
      setError(null)
      
      try {
        const generator = new YCSafePDFGenerator()
        const pdfBytes = await generator.createLivePreviewDocument(formData)
        setPdfData(pdfBytes)
      } catch (err) {
        console.error('Error generating preview PDF:', err)
        setError('Error generating preview')
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce PDF generation by 500ms to avoid too frequent updates
    const timeoutId = setTimeout(generatePDF, 500)
    return () => clearTimeout(timeoutId)
  }, [formData, isGenerating, isClient])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  const goToPrevPage = () => {
    setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1))
  }

  const goToNextPage = () => {
    setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages))
  }

  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.1, 2.0))
  }

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.1, 0.3))
  }

  // Show loading screen while client-side hydration happens
  if (!isClient) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <h3 className="text-base font-medium mb-1">Loading Preview</h3>
          <p className="text-muted-foreground text-sm">Initializing PDF viewer...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-medium mb-1">Preview Error</h3>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Preview Header */}
      <div className="flex items-center justify-between p-3 bg-white border-b">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Live Preview</span>
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <ZoomOut className="w-3 h-3" />
          </Button>
          <span className="text-xs text-muted-foreground px-2">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="outline" size="sm" onClick={zoomIn}>
            <ZoomIn className="w-3 h-3" />
          </Button>
          
          {/* Page Navigation */}
          {numPages > 0 && (
            <div className="flex items-center gap-2 ml-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
              >
                ←
              </Button>
              <span className="text-xs text-muted-foreground">
                {pageNumber} of {numPages}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToNextPage}
                disabled={pageNumber >= numPages}
              >
                →
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto p-4">
        <div className="flex justify-center">
          {pdfData ? (
            <div className="bg-white shadow-lg">
              <Document
                file={pdfData ? { data: pdfData } : null}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                }
                error={
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                      <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Failed to load PDF</p>
                    </div>
                  </div>
                }
              >
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale}
                  loading={
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  }
                />
              </Document>
            </div>
          ) : (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-base font-medium mb-1">Generating Preview</h3>
                <p className="text-muted-foreground text-sm">
                  Your document preview will appear here as you fill out the form
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Updating preview...</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">Preview up to date</span>
              </>
            )}
          </div>
          
          {pdfData && (
            <span className="text-xs text-muted-foreground">
              {Math.round(pdfData.length / 1024)}KB
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
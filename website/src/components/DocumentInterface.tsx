'use client'

import { useState, useRef } from 'react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  Eye,
  Settings
} from 'lucide-react'

export function DocumentInterface() {
  const { state, dispatch } = useApp()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return

    Array.from(files).forEach(file => {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const newDocument = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: 'PDF',
          uploadDate: new Date(),
          status: 'processing' as const
        }

        dispatch({ type: 'ADD_DOCUMENT', payload: newDocument })

        // Simulate processing delay
        setTimeout(() => {
          const summary = "Y Combinator Simple Agreement for Future Equity (SAFE) - Post-Money Valuation Cap (No Discount). This document outlines the investment terms for convertible equity including valuation cap and conversion triggers upon qualified financing or liquidity events."

          dispatch({ 
            type: 'UPDATE_DOCUMENT', 
            payload: { 
              id: newDocument.id, 
              updates: { 
                status: 'completed',
                summary,
                filledData: {
                  companyName: 'Your Company Inc.',
                  investorName: '[To be filled]',
                  purchaseAmount: '[To be filled]',
                  valuationCap: '[To be filled]',
                  state: 'Delaware'
                }
              } 
            } 
          })
        }, 2000)
      }
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processing':
        return { text: 'Processing...', color: 'text-yellow-600' }
      case 'completed':
        return { text: 'Ready for review', color: 'text-green-600' }
      case 'error':
        return { text: 'Processing failed', color: 'text-red-600' }
      default:
        return { text: 'Unknown', color: 'text-muted-foreground' }
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3 mb-1">
          <FileText className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-semibold">Smart Document Forms</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Upload legal documents and get AI-powered form completion with explanations
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <Card 
            className={`border-2 border-dashed transition-colors ${
              isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                <Upload className="w-10 h-10 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="font-medium mb-1 text-sm">Upload Legal Documents</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Drop PDF files here or click to browse. Supported formats: PDF
                  </p>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                  >
                    Choose Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {state.documents.length > 0 && (
            <div>
              <h2 className="text-base font-semibold mb-3">Your Documents</h2>
              <div className="space-y-3">
                {state.documents.map((doc) => {
                  const status = getStatusText(doc.status)
                  return (
                    <Card key={doc.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div>
                              <CardTitle className="text-base">{doc.name}</CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1">
                                {getStatusIcon(doc.status)}
                                <span className={status.color}>{status.text}</span>
                                <span className="text-muted-foreground">•</span>
                                <span>Uploaded {doc.uploadDate.toLocaleDateString()}</span>
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {doc.status === 'completed' && (
                              <>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-2" />
                                  Review
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </Button>
                                <Button size="sm">
                                  <Settings className="w-4 h-4 mr-2" />
                                  Complete Form
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      
                      {doc.summary && (
                        <CardContent className="pt-0">
                          <div className="bg-muted p-4 rounded-lg">
                            <h4 className="font-medium text-sm mb-2">AI Summary</h4>
                            <p className="text-sm text-muted-foreground">{doc.summary}</p>
                          </div>
                          
                          {doc.filledData && (
                            <div className="mt-4">
                              <h4 className="font-medium text-sm mb-3">Pre-filled Information</h4>
                              <div className="grid grid-cols-2 gap-3">
                                {Object.entries(doc.filledData).map(([key, value]) => (
                                  <div key={key} className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                      {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </label>
                                    <Input 
                                      value={value as string} 
                                      placeholder="Not filled"
                                      className="h-8 text-sm"
                                      readOnly
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {state.documents.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-base font-medium mb-1">No documents uploaded yet</h3>
              <p className="text-muted-foreground text-sm">
                Upload your first legal document to get started with intelligent form completion
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
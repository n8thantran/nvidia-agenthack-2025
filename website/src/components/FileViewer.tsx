'use client'

import { useState } from 'react'
import { X, File, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileViewerProps {
  isOpen: boolean
  onClose: () => void
  fileName: string
  fileType: string
  uploadDate: Date
  summary?: string
  fileUrl?: string
}

export function FileViewer({ isOpen, onClose, fileName, fileType, uploadDate, summary, fileUrl }: FileViewerProps) {
  const [isLoading, setIsLoading] = useState(true)

  if (!isOpen) return null

  const isImageFile = fileType.startsWith('image/')
  const isPDFFile = fileType === 'application/pdf'
  const isTextFile = fileType.startsWith('text/')

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <File className="w-5 h-5 text-gray-500" />
            <div>
              <h3 className="font-medium text-gray-900">{fileName}</h3>
              <p className="text-sm text-gray-500">
                Uploaded {uploadDate.toLocaleDateString()} • {fileType}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isPDFFile && fileUrl ? (
            <iframe
              src={fileUrl}
              className="w-full h-full border-0"
              title={fileName}
              onLoad={() => setIsLoading(false)}
            />
          ) : isPDFFile && !fileUrl ? (
            <div className="flex items-center justify-center h-full text-center py-12">
              <div>
                <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">PDF File</h4>
                <p className="text-gray-500">PDF preview not available</p>
              </div>
            </div>
          ) : isImageFile && fileUrl ? (
            <div className="flex items-center justify-center h-full p-4">
              <img
                src={fileUrl}
                alt={fileName}
                className="max-w-full max-h-full object-contain"
                onLoad={() => setIsLoading(false)}
              />
            </div>
          ) : isTextFile && fileUrl ? (
            <div className="h-full p-4 overflow-auto">
              <iframe
                src={fileUrl}
                className="w-full h-full border border-gray-200 rounded"
                title={fileName}
                onLoad={() => setIsLoading(false)}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center py-12">
              <div>
                <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">File Preview</h4>
                <p className="text-gray-500 mb-4">
                  Preview not available for this file type
                </p>
                {summary && (
                  <div className="bg-gray-50 rounded-lg p-4 text-left max-w-2xl mx-auto">
                    <h5 className="font-medium text-gray-900 mb-2">Summary</h5>
                    <p className="text-sm text-gray-700">{summary}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading preview...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
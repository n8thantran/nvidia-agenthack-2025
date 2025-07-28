'use client'

import { useState, useRef, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, MessageSquare, Clock, User, Bot, Upload, FileText, X, ChevronDown, Plus, Trash2, Loader2, Database, Lightbulb, Search, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { FileViewer } from './FileViewer'

const systemPrompt = `You are a specialized legal AI assistant for founders and entrepreneurs. You provide clear, practical legal guidance while always emphasizing the importance of consulting qualified legal professionals for specific advice.

Key principles:
- Provide general guidance and explanations of legal concepts
- Always recommend consulting a lawyer for specific legal decisions
- Explain complex legal terms in simple language
- Focus on startup and business law topics
- Be thorough but concise
- When analyzing uploaded documents, provide insights while noting limitations

Remember: You are a helpful resource, but not a substitute for professional legal counsel.`

// Mock database files
const mockDatabaseFiles = [
  { id: '1', name: 'Employment Agreement Template', type: 'Template', category: 'Employment' },
  { id: '2', name: 'NDA Template', type: 'Template', category: 'Confidentiality' },
  { id: '3', name: 'Investment Terms Sheet', type: 'Document', category: 'Investment' },
  { id: '4', name: 'Founder Agreement', type: 'Document', category: 'Partnership' },
  { id: '5', name: 'Privacy Policy Template', type: 'Template', category: 'Compliance' },
  { id: '6', name: 'Terms of Service Template', type: 'Template', category: 'Compliance' },
]

// Preset questions
const presetQuestions = [
  "What are the key terms I should include in an employment agreement?",
  "How do I protect my intellectual property when hiring contractors?",
  "What should I know about equity distribution for early employees?",
  "What are the legal requirements for raising a seed round?",
  "How do I structure a founder agreement to avoid future conflicts?",
  "What compliance issues should I consider for a SaaS business?",
  "How do I draft a solid NDA for potential investors?",
  "What are the legal implications of remote work policies?",
]

export function QAInterface() {
  const { state, dispatch } = useApp()
  const [question, setQuestion] = useState('')
  const [isAsking, setIsAsking] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [fileContents, setFileContents] = useState<string[]>([])
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [selectedUploadedFiles, setSelectedUploadedFiles] = useState<string[]>([])
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.qaSessions, isAsking])

  // Get current chat messages
  const currentChat = currentChatId 
    ? state.qaSessions.find(session => session.id === currentChatId)
    : null

  const allMessages = currentChat ? [currentChat] : state.qaSessions

  const handleAskQuestion = async (questionText: string) => {
    if (!questionText.trim()) return

    setIsAsking(true)
    
    try {
      // Prepare messages for API
      const messages = [
        { role: 'system', content: systemPrompt },
        ...allMessages.map(msg => [
          { role: 'user', content: msg.question },
          { role: 'assistant', content: msg.answer }
        ]).flat(),
        { role: 'user', content: questionText }
      ]

      // Add file context if files are uploaded
      if (uploadedFiles.length > 0 && fileContents.length > 0) {
        const fileContext = `\n\nUploaded documents:\n${fileContents.join('\n\n')}`
        messages[messages.length - 1].content += fileContext
      }

      // Add selected uploaded files context
      if (selectedUploadedFiles.length > 0) {
        const selectedFiles = state.documents.filter(doc => selectedUploadedFiles.includes(doc.id))
        const uploadedFileContext = `\n\nSelected uploaded files:\n${selectedFiles.map(doc => `[File: ${doc.name}]`).join('\n')}`
        messages[messages.length - 1].content += uploadedFileContext
      }

      // Call NVIDIA API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          temperature: 0.6,
          top_p: 0.95,
          max_tokens: 4096,
          frequency_penalty: 0,
          presence_penalty: 0,
          stream: false
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      const answer = data.choices[0].message.content

      const newSession = {
        id: Date.now().toString(),
        question: questionText,
        answer,
        timestamp: new Date(),
        category: 'Legal Q&A',
        files: uploadedFiles
      }

      dispatch({ type: 'ADD_QA_SESSION', payload: newSession })
      setQuestion('')
      setUploadedFiles([])
      setFileContents([])
      setSelectedUploadedFiles([])
      setCurrentChatId(newSession.id)
    } catch (error) {
      console.error('Error:', error)
      const fallbackAnswer = "I apologize, but I'm having trouble processing your request right now. Please try again or consult with a legal professional for immediate assistance."
      const newSession = {
        id: Date.now().toString(),
        question: questionText,
        answer: fallbackAnswer,
        timestamp: new Date(),
        category: 'Legal Q&A',
        files: uploadedFiles
      }
      dispatch({ type: 'ADD_QA_SESSION', payload: newSession })
      setQuestion('')
      setUploadedFiles([])
      setFileContents([])
      setSelectedUploadedFiles([])
      setCurrentChatId(newSession.id)
    } finally {
      setIsAsking(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleAskQuestion(question)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])

    try {
      const formData = new FormData()
      files.forEach(file => formData.append('files', file))

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload files')
      }

      const data = await response.json()
      setFileContents(prev => [...prev, ...data.fileContents])
      
      // Add files to global context
      files.forEach(file => {
        const fileUrl = URL.createObjectURL(file)
        const document = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          uploadDate: new Date(),
          status: 'completed' as const,
          summary: `Uploaded via Q&A interface`,
          fileUrl: fileUrl
        }
        dispatch({ type: 'ADD_DOCUMENT', payload: document })
      })
    } catch (error) {
      console.error('File upload error:', error)
      // Fallback: just show file names
      const fallbackContents = files.map(file => `[File: ${file.name} - Upload failed]`)
      setFileContents(prev => [...prev, ...fallbackContents])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    setFileContents(prev => prev.filter((_, i) => i !== index))
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const startNewChat = () => {
    setCurrentChatId(null)
    setUploadedFiles([])
    setFileContents([])
    setSelectedUploadedFiles([])
    setIsHistoryOpen(false)
  }

  const deleteChat = (chatId: string) => {
    dispatch({ type: 'DELETE_QA_SESSION', payload: chatId })
    if (currentChatId === chatId) {
      setCurrentChatId(null)
    }
  }

  const toggleUploadedFile = (fileId: string) => {
    setSelectedUploadedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  const [viewingFileId, setViewingFileId] = useState<string | null>(null)

  const askPresetQuestion = (presetQuestion: string) => {
    setQuestion(presetQuestion)
    handleAskQuestion(presetQuestion)
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Fixed */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-medium">Legal Q&A</span>
                  <ChevronDown className={cn(
                    "w-4 h-4 transition-transform",
                    isHistoryOpen && "rotate-180"
                  )} />
                </button>
                
                {isHistoryOpen && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-gray-100">
                      <button
                        onClick={startNewChat}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">New chat</span>
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {state.qaSessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                          <button
                            onClick={() => setCurrentChatId(session.id)}
                            className="flex-1 text-left text-sm truncate"
                          >
                            {session.question.substring(0, 50)}...
                          </button>
                          <button
                            onClick={() => deleteChat(session.id)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Trash2 className="w-3 h-3 text-gray-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Database className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Messages - Scrollable */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 bg-gray-50"
        >
          {allMessages.length === 0 && !isAsking && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start a legal conversation</h3>
              <p className="text-gray-500 mb-6">Ask questions about startup law, upload documents for analysis, or browse our templates.</p>
            </div>
          )}

          {allMessages.map((session) => (
            <div key={session.id} className="space-y-4">
              {/* User Message */}
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-900 mb-2">{session.question}</div>
                  {session.files && session.files.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500 mb-2">Attached files:</div>
                      <div className="flex flex-wrap gap-2">
                        {session.files.map((file, index) => (
                          <div key={index} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                            <FileText className="w-3 h-3" />
                            <span>{file.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Response */}
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 bg-white rounded-lg p-4 border border-gray-200">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="text-gray-700">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                        em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                        code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                        pre: ({ children }) => <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto mb-3">{children}</pre>,
                        blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-3">{children}</blockquote>,
                      }}
                    >
                      {session.answer}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Loading Message */}
          {isAsking && (
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                  <span className="text-sm text-gray-500">Analyzing your question...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Fixed */}
        <div className="bg-white border-t border-gray-200 p-6 flex-shrink-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Uploads */}
            {(uploadedFiles.length > 0 || selectedUploadedFiles.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                    <FileText className="w-3 h-3 text-blue-600" />
                    <span className="text-xs text-blue-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {selectedUploadedFiles.map((fileId) => {
                  const doc = state.documents.find(d => d.id === fileId)
                  return doc ? (
                    <div key={fileId} className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg">
                      <FileText className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-700">{doc.name}</span>
                      <button
                        type="button"
                        onClick={() => toggleUploadedFile(fileId)}
                        className="text-green-500 hover:text-green-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : null
                })}
              </div>
            )}

            {/* Input and Buttons */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a legal question or upload documents..."
                  className="pr-20"
                  disabled={isAsking}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                  <button
                    type="button"
                    onClick={triggerFileUpload}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    disabled={isAsking}
                  >
                    <Upload className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={!question.trim() || isAsking}
                className="px-6"
              >
                {isAsking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Right Sidebar - Fixed */}
      {isRightSidebarOpen && (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
          {/* Uploaded Files */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                <FileText className="w-3 h-3 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Uploaded Files</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">Select files to include in your query context</p>
            
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {state.documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">
                    No files uploaded yet
                  </p>
                </div>
              ) : (
                state.documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => toggleUploadedFile(doc.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all duration-200 group",
                      selectedUploadedFiles.includes(doc.id)
                        ? "bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-200"
                        : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-5 h-5 rounded flex items-center justify-center",
                          selectedUploadedFiles.includes(doc.id) ? "bg-blue-100" : "bg-gray-100"
                        )}>
                          <FileText className={cn(
                            "w-3 h-3",
                            selectedUploadedFiles.includes(doc.id) ? "text-blue-600" : "text-gray-500"
                          )} />
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-700">
                          {doc.type.split('/')[1]?.toUpperCase() || 'FILE'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {selectedUploadedFiles.includes(doc.id) && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setViewingFileId(doc.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                        >
                          <Eye className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 leading-tight">
                      {doc.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Uploaded {doc.uploadDate.toLocaleDateString()}
                    </div>
                  </button>
                ))
              )}
            </div>
            
            {selectedUploadedFiles.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-xs text-blue-600 font-medium">
                  {selectedUploadedFiles.length} file{selectedUploadedFiles.length !== 1 ? 's' : ''} selected
                </div>
              </div>
            )}
          </div>

          {/* Preset Questions */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-yellow-100 rounded-md flex items-center justify-center">
                <Lightbulb className="w-3 h-3 text-yellow-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Quick Questions</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">Common legal questions for founders</p>
            
            <div className="space-y-2">
              {presetQuestions.map((presetQuestion, index) => (
                <button
                  key={index}
                  onClick={() => askPresetQuestion(presetQuestion)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-all duration-200 group",
                    "bg-white border-gray-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:border-blue-200",
                    isAsking && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={isAsking}
                >
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div className="text-sm text-gray-900 line-clamp-3 leading-relaxed group-hover:text-blue-900">
                      {presetQuestion}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* File Viewer Modal */}
      {viewingFileId && (() => {
        const doc = state.documents.find(d => d.id === viewingFileId)
        return doc ? (
          <FileViewer
            isOpen={true}
            onClose={() => setViewingFileId(null)}
            fileName={doc.name}
            fileType={doc.type}
            uploadDate={doc.uploadDate}
            summary={doc.summary}
            fileUrl={doc.fileUrl}
          />
        ) : null
      })()}
    </div>
  )
}
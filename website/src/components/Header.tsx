'use client'

import React, { useState } from 'react'
import { Search, ChevronDown, User, LogOut, Settings, Bell, FileText, MessageSquare, PlusCircle, Zap, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/context/AppContext'
import { FileViewer } from './FileViewer'

export function Header() {
  const { state, dispatch } = useApp()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewingFileId, setViewingFileId] = useState<string | null>(null)

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setIsSearchOpen(true)
      }
      
      if (event.key === 'Escape') {
        setIsSearchOpen(false)
        setIsUserDropdownOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Define available pages
  const pages = [
    { id: 'qa', title: 'Legal Q&A', type: 'Page', icon: MessageSquare, description: 'Ask legal questions and get AI assistance' },
    { id: 'generator', title: 'Document Generator', type: 'Page', icon: PlusCircle, description: 'Create legal documents from templates' },
    { id: 'simulation', title: 'Legal Simulation', type: 'Page', icon: Zap, description: 'Run scenario planning and simulations' },
  ]

  // Combine pages, uploaded files, and Q&A sessions for search
  const allSearchableItems = [
    // Pages
    ...pages.map(page => ({
      id: page.id,
      title: page.title,
      type: page.type,
      description: page.description,
      icon: page.icon,
      date: 'Navigation',
      action: () => {
        dispatch({ type: 'SET_ACTIVE_TAB', payload: page.id as any })
        setIsSearchOpen(false)
      }
    })),
    // Uploaded Files
    ...state.documents.map(doc => ({
      id: doc.id,
      title: doc.name,
      type: 'Uploaded File',
      description: `${doc.type} • ${doc.summary || 'Uploaded file'}`,
      icon: FileText,
      date: doc.uploadDate.toLocaleDateString(),
      fileUrl: doc.fileUrl,
      action: () => {
        setViewingFileId(doc.id)
        setIsSearchOpen(false)
      }
    })),
    // Q&A Sessions
    ...state.qaSessions.map(session => ({
      id: session.id,
      title: session.question.length > 50 ? session.question.substring(0, 50) + '...' : session.question,
      type: 'Q&A Session',
      description: session.answer.length > 100 ? session.answer.substring(0, 100) + '...' : session.answer,
      icon: MessageSquare,
      date: session.timestamp.toLocaleDateString(),
      action: () => {
        dispatch({ type: 'SET_ACTIVE_TAB', payload: 'qa' })
        setIsSearchOpen(false)
      }
    }))
  ]

  // Filter search results
  const searchResults = allSearchableItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center px-8 relative">
      {/* Left side - empty */}
      <div className="flex items-center gap-6">
        <div className="w-8 h-8" /> {/* Invisible spacer for balance */}
      </div>
      
      {/* Center - search */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-lg">
          <div 
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-200 cursor-pointer",
              isSearchOpen 
                ? "border-gray-300 bg-white shadow-md" 
                : "border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300 hover:shadow-sm"
            )}
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">Search files, documents, Q&A...</span>
            <div className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-500">
              ⌘ K
            </div>
          </div>
          
          {/* Search Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[420px] bg-white border border-gray-200 rounded-2xl shadow-xl z-50">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search files, documents, Q&A sessions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 outline-none text-sm placeholder-gray-400"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsSearchOpen(false)
                      }
                    }}
                  />
                </div>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {searchQuery ? (
                  searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((result) => {
                        const IconComponent = result.icon
                        return (
                          <div 
                            key={result.id} 
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 group"
                            onClick={result.action}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                                <IconComponent className="w-4 h-4 text-gray-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-900 mb-1 truncate">{result.title}</div>
                                <div className="text-xs text-gray-500 mb-1 truncate">{result.description}</div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">
                                    {result.type}
                                  </span>
                                  <span>•</span>
                                  <span>{result.date}</span>
                                </div>
                              </div>
                              {result.type === 'Uploaded File' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setViewingFileId(result.id)
                                    setIsSearchOpen(false)
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                                >
                                  <Eye className="w-4 h-4 text-gray-500" />
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="text-gray-400 mb-2">
                        <Search className="w-8 h-8 mx-auto" />
                      </div>
                      <div className="text-sm text-gray-500 mb-1">No results found</div>
                      <div className="text-xs text-gray-400">Try searching with different keywords</div>
                    </div>
                  )
                ) : (
                  <div className="p-6">
                    <div className="text-sm font-medium text-gray-900 mb-4">Quick Access</div>
                    <div className="space-y-2">
                      {allSearchableItems.slice(0, 6).map((result) => {
                        const IconComponent = result.icon
                        return (
                          <div 
                            key={result.id} 
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-150 group"
                            onClick={result.action}
                          >
                            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                              <IconComponent className="w-3 h-3 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-gray-900 truncate">{result.title}</div>
                              <div className="text-xs text-gray-500 truncate">{result.type}</div>
                            </div>
                            {result.type === 'Uploaded File' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setViewingFileId(result.id)
                                  setIsSearchOpen(false)
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                              >
                                <Eye className="w-3 h-3 text-gray-500" />
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Right side - user profile */}
      <div className="flex items-center gap-6">
        {/* User Profile */}
        <div className="relative">
          <div 
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200"
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-semibold">MR</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">Mizan Rupan-Tompkins</span>
              <span className="text-xs text-gray-500">Account Owner</span>
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 text-gray-400 transition-transform duration-200",
              isUserDropdownOpen && "rotate-180"
            )} />
          </div>
          
          {/* User Dropdown */}
          {isUserDropdownOpen && (
            <div className="absolute top-full right-0 mt-3 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white text-sm font-semibold">MR</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-900">Mizan Rupan-Tompkins</div>
                    <div className="text-xs text-gray-500">mizan@stratusaviation.com</div>
                  </div>
                </div>
              </div>
              
              <div className="py-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                  <User className="w-4 h-4" />
                  Profile Settings
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                  <Bell className="w-4 h-4" />
                  Notifications
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                  <Settings className="w-4 h-4" />
                  Preferences
                </button>
                <div className="border-t border-gray-100 my-2" />
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Click outside to close dropdowns */}
      {(isSearchOpen || isUserDropdownOpen) && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsSearchOpen(false)
            setIsUserDropdownOpen(false)
          }}
        />
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
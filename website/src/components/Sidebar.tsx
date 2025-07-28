'use client'

import React, { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'
import { FileViewer } from './FileViewer'
import { 
  MessageSquare, 
  FileText, 
  PlusCircle, 
  Zap,
  Scale,
  ChevronDown,
  Users,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  File,
  Eye
} from 'lucide-react'

const navigationItems = [
  {
    id: 'qa' as const,
    label: 'Legal Q&A',
    icon: MessageSquare,
    description: 'Ask legal questions'
  },
  {
    id: 'generator' as const,
    label: 'Document Generator',
    icon: PlusCircle,
    description: 'Create legal documents'
  },
  {
    id: 'simulation' as const,
    label: 'Legal Simulation',
    icon: Zap,
    description: 'Scenario planning'
  }
]

const workflowItems = [
  {
    id: 'expenses' as const,
    label: 'Expenses',
    icon: FileText,
  },
  {
    id: 'billpay' as const,
    label: 'Bill Pay',
    icon: FileText,
  }
]

const adminItems = [
  {
    id: 'users' as const,
    label: 'Users',
    icon: Users,
  },
  {
    id: 'integrations' as const,
    label: 'Integrations',
    icon: FileText,
  },
  {
    id: 'perks' as const,
    label: 'Partner Perks',
    icon: FileText,
  },
  {
    id: 'settings' as const,
    label: 'Settings',
    icon: Settings,
  }
]

// Mock companies
const companies = [
  { id: 'sa', name: 'Stratus Aviation', initials: 'SA', color: 'bg-gray-300' },
  { id: 'tech', name: 'TechFlow Solutions', initials: 'TF', color: 'bg-blue-300' },
  { id: 'health', name: 'HealthVantage', initials: 'HV', color: 'bg-green-300' },
  { id: 'fintech', name: 'FinTech Innovations', initials: 'FI', color: 'bg-purple-300' },
]

export function Sidebar() {
  const { state, dispatch } = useApp()
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState(companies[0])
  const [viewingFile, setViewingFile] = useState<string | null>(null)

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 h-full flex flex-col relative transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Gold accent bar */}
      <div className="w-1 bg-yellow-400 h-full absolute left-0 top-0" />
      
      {/* Expand button when collapsed */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="absolute -right-3 top-8 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
        >
          <PanelLeftOpen className="w-3 h-3 text-gray-600" />
        </button>
      )}
      
      <div className="flex-1 flex flex-col pl-1">
        {/* Header */}
        <div className={cn(
          "transition-all duration-300",
          isCollapsed ? "p-4" : "p-6 pb-4"
        )}>
          <div className={cn(
            "flex items-center transition-all duration-300",
            isCollapsed ? "justify-center" : "justify-between"
          )}>
            <div className="flex items-center gap-3">
              <Scale className="w-6 h-6 text-black" />
              {!isCollapsed && (
                <span className="font-serif font-bold text-black text-2xl" style={{ fontFamily: 'Georgia, serif' }}>
                  Juri
                </span>
              )}
            </div>
            {!isCollapsed && (
              <button 
                onClick={() => setIsCollapsed(true)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <PanelLeftClose className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Account Selector */}
        {!isCollapsed && (
          <div className="px-6 pb-6 relative">
            <div 
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
            >
              <div className={cn("w-8 h-8 rounded flex items-center justify-center", selectedCompany.color)}>
                <span className="text-sm font-medium text-gray-700">{selectedCompany.initials}</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{selectedCompany.name}</div>
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 text-gray-500 transition-transform",
                isCompanyDropdownOpen && "rotate-180"
              )} />
            </div>
            
            {/* Company Dropdown */}
            {isCompanyDropdownOpen && (
              <div className="absolute top-full left-6 right-6 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="py-2">
                  {companies.map((company) => (
                    <button
                      key={company.id}
                      onClick={() => {
                        setSelectedCompany(company)
                        setIsCompanyDropdownOpen(false)
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50",
                        selectedCompany.id === company.id ? "bg-gray-50" : ""
                      )}
                    >
                      <div className={cn("w-6 h-6 rounded flex items-center justify-center", company.color)}>
                        <span className="text-xs font-medium text-gray-700">{company.initials}</span>
                      </div>
                      <span className="text-gray-900">{company.name}</span>
                    </button>
                  ))}
                  
                  <div className="border-t border-gray-200 my-2" />
                  
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                    <Plus className="w-4 h-4" />
                    Add Company
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className={cn(
          "flex-1 transition-all duration-300",
          isCollapsed ? "px-2" : "px-6"
        )}>
          <div className="space-y-6">
            {/* Main Navigation */}
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = state.activeTab === item.id
                
                return (
                  <button
                    key={item.id}
                    onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: item.id })}
                    className={cn(
                      "w-full flex items-center transition-colors group",
                      isCollapsed 
                        ? "justify-center px-2 py-3 rounded-lg" 
                        : "gap-3 px-3 py-2.5 rounded-lg text-left",
                      isActive 
                        ? "bg-gray-100 text-black" 
                        : "text-gray-700 hover:bg-gray-50 hover:text-black"
                    )}
                  >
                    <Icon className={cn(
                      "flex-shrink-0",
                      isCollapsed ? "w-5 h-5" : "w-4 h-4",
                      isActive ? "text-black" : "text-gray-500 group-hover:text-black"
                    )} />
                    {!isCollapsed && (
                      <>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            {item.label}
                          </div>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Workflows Section */}
            {!isCollapsed && (
              <div className="space-y-1">
                <div className="px-3 py-2">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Workflows</h3>
                </div>
                {workflowItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors group text-gray-700 hover:bg-gray-50 hover:text-black"
                    >
                      <Icon className="w-4 h-4 flex-shrink-0 text-gray-500 group-hover:text-black" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">
                          {item.label}
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                  )
                })}
              </div>
            )}

            {/* Uploaded Files Section */}
            {!isCollapsed && (
              <div className="space-y-1">
                <div className="px-3 py-2">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded Files</h3>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {state.documents.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-gray-400">
                      No files uploaded yet
                    </div>
                  ) : (
                    state.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <File className="w-4 h-4 flex-shrink-0 text-gray-500 group-hover:text-black" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-gray-700 truncate">
                            {doc.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {doc.uploadDate.toLocaleDateString()}
                          </div>
                        </div>
                        <button 
                          onClick={() => setViewingFile(doc.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Administration Section */}
            {!isCollapsed && (
              <div className="space-y-1">
                <div className="px-3 py-2">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Administration</h3>
                </div>
                {adminItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors group text-gray-700 hover:bg-gray-50 hover:text-black"
                    >
                      <Icon className="w-4 h-4 flex-shrink-0 text-gray-500 group-hover:text-black" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">
                          {item.label}
                        </div>
                      </div>
                      {item.id !== 'settings' && <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Bottom Actions */}
        {/* Removed Maps button as requested */}
      </div>
      
      {/* Click outside to close dropdown */}
      {isCompanyDropdownOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsCompanyDropdownOpen(false)}
        />
      )}
      
      {/* File Viewer Modal */}
      {viewingFile && (() => {
        const doc = state.documents.find(d => d.id === viewingFile)
        return doc ? (
          <FileViewer
            isOpen={true}
            onClose={() => setViewingFile(null)}
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
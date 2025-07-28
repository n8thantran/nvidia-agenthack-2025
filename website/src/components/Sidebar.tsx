'use client'

import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'
import { 
  MessageSquare, 
  FileText, 
  PlusCircle, 
  Zap,
  Scale,
  Home
} from 'lucide-react'

const navigationItems = [
  {
    id: 'qa' as const,
    label: 'Legal Q&A',
    icon: MessageSquare,
    description: 'Ask legal questions'
  },
  {
    id: 'documents' as const,
    label: 'Smart Forms',
    icon: FileText,
    description: 'Upload & complete documents'
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

export function Sidebar() {
  const { state, dispatch } = useApp()

  return (
    <div className="w-56 bg-background border-r border-border h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <Scale className="w-5 h-5 text-primary" />
          <span className="font-semibold text-base">LegalAI</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Your AI legal assistant for founders
        </p>
      </div>

      <nav className="flex-1 p-3">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = state.activeTab === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: item.id })}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-2 rounded-md text-left transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs">
                    {item.label}
                  </div>
                  <div className="text-xs opacity-75 truncate">
                    {item.description}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </nav>

      <div className="p-3 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <div className="font-medium mb-1">Recent Activity</div>
          <div className="space-y-1">
            <div>• {state.qaSessions.length} questions asked</div>
            <div>• {state.documents.length} documents processed</div>
          </div>
        </div>
      </div>
    </div>
  )
}
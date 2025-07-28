'use client'

import { createContext, useContext, useReducer, ReactNode } from 'react'

interface Document {
  id: string
  name: string
  type: string
  uploadDate: Date
  status: 'processing' | 'completed' | 'error'
  summary?: string
  filledData?: Record<string, unknown>
}

interface QASession {
  id: string
  question: string
  answer: string
  timestamp: Date
  category: string
  files?: File[]
}

interface AppState {
  documents: Document[]
  qaSessions: QASession[]
  currentDocument: Document | null
  isLoading: boolean
  activeTab: 'qa' | 'generator' | 'simulation'
}

type AppAction = 
  | { type: 'SET_DOCUMENTS'; payload: Document[] }
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'UPDATE_DOCUMENT'; payload: { id: string; updates: Partial<Document> } }
  | { type: 'SET_CURRENT_DOCUMENT'; payload: Document | null }
  | { type: 'ADD_QA_SESSION'; payload: QASession }
  | { type: 'SET_QA_SESSIONS'; payload: QASession[] }
  | { type: 'DELETE_QA_SESSION'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ACTIVE_TAB'; payload: AppState['activeTab'] }

const initialState: AppState = {
  documents: [],
  qaSessions: [],
  currentDocument: null,
  isLoading: false,
  activeTab: 'qa'
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_DOCUMENTS':
      return { ...state, documents: action.payload }
    case 'ADD_DOCUMENT':
      return { ...state, documents: [...state.documents, action.payload] }
    case 'UPDATE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.map(doc =>
          doc.id === action.payload.id 
            ? { ...doc, ...action.payload.updates }
            : doc
        )
      }
    case 'SET_CURRENT_DOCUMENT':
      return { ...state, currentDocument: action.payload }
    case 'ADD_QA_SESSION':
      return { ...state, qaSessions: [...state.qaSessions, action.payload] }
    case 'SET_QA_SESSIONS':
      return { ...state, qaSessions: action.payload }
    case 'DELETE_QA_SESSION':
      return { ...state, qaSessions: state.qaSessions.filter(session => session.id !== action.payload) }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload }
    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
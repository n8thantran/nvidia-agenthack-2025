'use client'

import { useApp } from '@/context/AppContext'
import { QAInterface } from './QAInterface'
import { DocumentInterface } from './DocumentInterface'
import { DocumentGenerator } from './DocumentGenerator'
import { LegalSimulation } from './LegalSimulation'

export function MainContent() {
  const { state } = useApp()

  const renderContent = () => {
    switch (state.activeTab) {
      case 'qa':
        return <QAInterface />
      case 'documents':
        return <DocumentInterface />
      case 'generator':
        return <DocumentGenerator />
      case 'simulation':
        return <LegalSimulation />
      default:
        return <QAInterface />
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {renderContent()}
    </div>
  )
}
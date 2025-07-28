import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { MainContent } from '@/components/MainContent'

export default function Home() {
  return (
    <div className="h-screen w-screen flex bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0">
        <Header />
        <MainContent />
      </div>
    </div>
  )
}

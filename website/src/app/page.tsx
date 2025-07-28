import { Sidebar } from '@/components/Sidebar'
import { MainContent } from '@/components/MainContent'

export default function Home() {
  return (
    <div className="h-screen flex bg-background">
      <Sidebar />
      <MainContent />
    </div>
  )
}

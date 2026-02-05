import { Navbar } from '@/components/layout/navbar'
import { Sidebar } from '@/components/layout/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background relative">
      {/* Background decorative elements inspired by Atlas */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Sidebar - Hidden on mobile, handled via Sheet or simple CSS toggle in improved implementations */}
      <Sidebar />
      
      <div className="flex flex-col flex-1 h-full overflow-hidden relative z-10">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 relative">
           {/* Background gradient hint */}
           <div className="absolute top-0 left-0 w-full h-96 bg-accent/5 -z-10 rounded-b-[3rem] backdrop-blur-3xl" />
           
           <div className="mx-auto max-w-7xl animate-fade-in-up">
              {children}
           </div>
        </main>
      </div>
    </div>
  )
}

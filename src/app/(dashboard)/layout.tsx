import { Navbar } from '@/components/layout/navbar'
import { Sidebar } from '@/components/layout/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background relative">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area - adjusts automatically to sidebar width */}
      <div className="flex flex-col flex-1 h-full overflow-hidden relative z-10 transition-all duration-300">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 relative">
           {/* Background gradient hint */}
           <div className="absolute top-0 left-0 w-full h-96 bg-accent/5 -z-10 rounded-b-[3rem] backdrop-blur-3xl" />
           
           <div className="mx-auto max-w-[1600px] h-full">
              {children}
           </div>
        </main>
      </div>
    </div>
  )
}

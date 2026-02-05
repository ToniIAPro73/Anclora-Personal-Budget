import { Sidebar } from "./sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background relative overflow-hidden">
      {/* Background decorative elements inspired by Atlas */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-8 relative z-10">
        <div className="mx-auto max-w-7xl animate-fade-in-up">
          {children}
        </div>
      </main>
    </div>
  );
}

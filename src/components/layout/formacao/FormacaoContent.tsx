
import { cn } from "@/lib/utils";
import { BaseContentProps } from "../BaseLayout";

export const FormacaoContent = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  children 
}: BaseContentProps) => {
  return (
    <div 
      className={cn(
        "flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-hidden"
      )}
    >
      {/* Header simples para Formação */}
      <header className="bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-md hover:bg-accent"
            aria-label="Toggle sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold">Área de Formação</h1>
        </div>
      </header>
      
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
};

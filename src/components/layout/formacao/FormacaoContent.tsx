
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormacaoContentProps {
  children: React.ReactNode;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const FormacaoContent = ({ children, sidebarOpen, setSidebarOpen }: FormacaoContentProps) => {
  return (
    <main className={`relative flex-1 transition-all duration-300 ease-in-out ${
      sidebarOpen ? "md:ml-64" : "md:ml-[70px]"
    }`}>
      <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:hidden">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      <div className="container mx-auto p-4 md:p-6">
        {children}
      </div>
    </main>
  );
};

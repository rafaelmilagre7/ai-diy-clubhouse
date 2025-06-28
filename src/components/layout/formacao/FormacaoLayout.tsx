
import { ReactNode, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { FormacaoSidebar } from "./FormacaoSidebar";
import { FormacaoContent } from "./FormacaoContent";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";

interface FormacaoLayoutProps {
  children: ReactNode;
}

const FormacaoLayout = ({ children }: FormacaoLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useSimpleAuth();

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  return (
    <div className="flex h-screen bg-background">
      <FormacaoSidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <FormacaoContent
        onSignOut={signOut}
        profileName={user?.user_metadata?.name || user?.email || 'Usuário'}
        profileEmail={user?.email || ''}
        getInitials={getInitials}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      >
        {children}
      </FormacaoContent>
      <Toaster />
    </div>
  );
};

export default FormacaoLayout;

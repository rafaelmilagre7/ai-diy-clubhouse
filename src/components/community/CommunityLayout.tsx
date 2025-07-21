
import { ReactNode } from "react";

interface CommunityLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showStats?: boolean;
}

export const CommunityLayout = ({ 
  children, 
  title = "Comunidade VIVER DE IA",
  description = "Conecte-se, compartilhe conhecimento e tire suas dúvidas sobre IA",
  showStats = false 
}: CommunityLayoutProps) => {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {children}
      </div>
    </div>
  );
};

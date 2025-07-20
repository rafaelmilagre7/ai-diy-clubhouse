
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {title}
          </h1>
          <p className="text-muted-foreground">
            {description}
          </p>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
};

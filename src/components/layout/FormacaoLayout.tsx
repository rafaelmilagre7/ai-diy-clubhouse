
import React from "react";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { Sidebar } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";

const FormacaoLayout = ({ children }: { children: React.ReactNode }) => {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        toast.success("Logout realizado com sucesso");
      } else {
        toast.error("Erro ao fazer logout");
      }
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar simples para formação */}
      <div className="w-64 bg-card border-r">
        <div className="p-6">
          <h2 className="text-xl font-bold">Formação</h2>
          <p className="text-sm text-muted-foreground">
            {profile?.name || profile?.email}
          </p>
        </div>
        <nav className="p-4 space-y-2">
          <a href="/formacao" className="block p-2 hover:bg-muted rounded">
            Dashboard
          </a>
          <a href="/formacao/courses" className="block p-2 hover:bg-muted rounded">
            Cursos
          </a>
          <a href="/formacao/students" className="block p-2 hover:bg-muted rounded">
            Estudantes
          </a>
          <a href="/formacao/reports" className="block p-2 hover:bg-muted rounded">
            Relatórios
          </a>
        </nav>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
};

export default FormacaoLayout;

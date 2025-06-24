
import React, { useState } from "react";
import { Module } from "@/lib/supabase";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ImplementationTabsNavigation } from "./ImplementationTabsNavigation";
import { ModuleContentRenderer } from "./content/ModuleContentRenderer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useLogging } from "@/hooks/useLogging";

interface DefaultModuleProps {
  module: Module;
  onComplete: () => void;
  onInteraction?: () => void;
}

export const DefaultModule = ({ module, onComplete, onInteraction }: DefaultModuleProps) => {
  const [activeTab, setActiveTab] = useState('tools');
  const [hasInteracted, setHasInteracted] = useState(false);
  const { log } = useLogging();

  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      log("User interacted with module content", { moduleId: module.id });
      if (onInteraction) {
        onInteraction();
      }
    }
  };

  const handleComplete = () => {
    log("Module marked as complete", { moduleId: module.id, moduleTitle: module.title });
    onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-gradient-to-r from-viverblue/10 to-viverblue/5 rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">{module.title}</h1>
        {module.description && (
          <p className="text-muted-foreground">{module.description}</p>
        )}
      </div>

      {/* Implementation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <ImplementationTabsNavigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        <div className="mt-6">
          <TabsContent value="tools" className="space-y-6">
            <div className="bg-card rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Ferramentas Necessárias</h3>
              <ModuleContentRenderer module={module} onInteraction={handleInteraction} />
            </div>
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <div className="bg-card rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Materiais de Apoio</h3>
              <p className="text-muted-foreground">
                Aqui você encontrará todos os materiais necessários para implementar este módulo.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="videos" className="space-y-6">
            <div className="bg-card rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Vídeos Explicativos</h3>
              <p className="text-muted-foreground">
                Assista aos vídeos para entender melhor como implementar este módulo.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="checklist" className="space-y-6">
            <div className="bg-card rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Checklist de Implementação</h3>
              <p className="text-muted-foreground">
                Verifique se todos os itens foram completados antes de finalizar.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-6">
            <div className="bg-card rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Comentários e Dúvidas</h3>
              <p className="text-muted-foreground">
                Compartilhe suas dúvidas ou deixe comentários sobre este módulo.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="complete" className="space-y-6">
            <div className="bg-card rounded-lg p-6 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Finalizar Módulo</h3>
              <p className="text-muted-foreground mb-6">
                Você completou todos os passos deste módulo. Clique em finalizar para continuar.
              </p>
              <Button 
                onClick={handleComplete}
                size="lg"
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="h-5 w-5" />
                Finalizar Módulo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

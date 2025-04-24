
import React from "react";
import { Module } from "@/lib/supabase";
import { GlassCard } from "@/components/ui/GlassCard";
import { useLogging } from "@/hooks/useLogging";

interface ModuleContentFAQProps {
  module: Module;
}

export const ModuleContentFAQ: React.FC<ModuleContentFAQProps> = ({ module }) => {
  const { log } = useLogging("ModuleContentFAQ");
  
  // Verificar se existem perguntas frequentes no módulo
  const hasFAQContent = module.content?.faq && Array.isArray(module.content.faq) && module.content.faq.length > 0;
  
  React.useEffect(() => {
    log("FAQ renderizado", { 
      module_id: module.id, 
      has_content: hasFAQContent 
    });
  }, [module.id, hasFAQContent, log]);

  if (!hasFAQContent) {
    return (
      <GlassCard className="p-4 text-center">
        <p className="text-muted-foreground">
          Nenhuma pergunta frequente disponível para este módulo.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-4">Perguntas Frequentes</h3>
      {module.content.faq.map((item: any, index: number) => (
        <GlassCard key={index} className="p-4">
          <div className="space-y-2">
            <h4 className="font-medium text-[#0ABAB5]">{item.question}</h4>
            <p className="text-sm">{item.answer}</p>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};

export default ModuleContentFAQ;

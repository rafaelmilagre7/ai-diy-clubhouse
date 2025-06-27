
import React, { useEffect } from "react";
import { Module } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Trophy, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";

interface CelebrationModuleProps {
  module: Module;
  onComplete: () => void;
}

export const CelebrationModule = ({ module, onComplete }: CelebrationModuleProps) => {
  
  // Auto-complete após alguns segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Safe content rendering helper
  const renderContent = (content: any) => {
    if (typeof content === 'string') {
      return content;
    }
    return '';
  };

  return (
    <div className="text-center space-y-8 py-12">
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-8">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="bg-green-500/20 rounded-full p-6">
              <Trophy className="h-16 w-16 text-green-500" />
            </div>
            <Sparkles className="h-8 w-8 absolute -top-2 -right-2 text-yellow-500 animate-pulse" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-green-700">
          {module.title || "Parabéns! Implementação Concluída!"}
        </h1>
        
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="h-12 w-12 text-green-500 animate-bounce" />
        </div>

        {module.description && (
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            {module.description}
          </p>
        )}

        {module.content && (
          <div className="prose prose-sm max-w-none text-muted-foreground mb-8">
            <div dangerouslySetInnerHTML={{ __html: renderContent(module.content) }} />
          </div>
        )}

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Redirecionando automaticamente em alguns segundos...
          </p>
          
          <Button 
            onClick={onComplete}
            size="lg"
            className="flex items-center gap-2"
          >
            Finalizar Agora
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

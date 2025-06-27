
import React from "react";
import { Module } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, ArrowRight } from "lucide-react";

interface CelebrationModuleProps {
  module: Module;
  onComplete: () => void;
}

export const CelebrationModule = ({ module, onComplete }: CelebrationModuleProps) => {
  // Safe content rendering helper
  const renderContent = (content: any) => {
    if (typeof content === 'string') {
      return content;
    }
    return '';
  };

  return (
    <div className="text-center space-y-8 py-12">
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-8 border border-yellow-200">
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-100 rounded-full p-4">
            <Trophy className="h-12 w-12 text-yellow-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-yellow-800">{module.title}</h1>
        
        {module.description && (
          <p className="text-lg text-yellow-700 mb-6 max-w-2xl mx-auto">
            {module.description}
          </p>
        )}

        {module.content && (
          <div className="prose prose-sm max-w-none text-yellow-600 mb-8">
            <div dangerouslySetInnerHTML={{ __html: renderContent(module.content) }} />
          </div>
        )}

        <div className="flex justify-center items-center gap-2 mb-6">
          <Star className="h-5 w-5 text-yellow-500 fill-current" />
          <Star className="h-5 w-5 text-yellow-500 fill-current" />
          <Star className="h-5 w-5 text-yellow-500 fill-current" />
        </div>

        <Badge variant="secondary" className="mb-6 bg-yellow-100 text-yellow-800">
          Parabéns! Você concluiu esta implementação!
        </Badge>

        <Button 
          onClick={onComplete}
          size="lg"
          className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700"
        >
          Finalizar
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

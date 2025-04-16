
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { ModuleTitle } from "./ModuleTitle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface DefaultModuleProps {
  module: any;
  onComplete: () => void;
}

export const DefaultModule = ({ module, onComplete }: DefaultModuleProps) => {
  // Função para renderizar conteúdo HTML seguro (se disponível)
  const renderContent = (content: any) => {
    if (typeof content === 'string') {
      return { __html: content };
    } else if (content && content.blocks) {
      // Implementação básica para conteúdo do Editor.js (se estiver usando este formato)
      return { __html: content.blocks.map((block: any) => {
        if (block.type === 'paragraph') {
          return `<p>${block.data.text}</p>`;
        } else if (block.type === 'header') {
          return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
        } else if (block.type === 'list') {
          const listItems = block.data.items.map((item: string) => `<li>${item}</li>`).join('');
          return block.data.style === 'ordered' ? `<ol>${listItems}</ol>` : `<ul>${listItems}</ul>`;
        }
        return '';
      }).join('')};
    }
    
    return { __html: '<p>Conteúdo não disponível.</p>' };
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <h2 className="text-2xl font-semibold">
        <ModuleTitle type={module.type} />
      </h2>
      
      {module.content && (
        <div className="prose prose-blue max-w-none">
          {module.content.html ? (
            <div dangerouslySetInnerHTML={{ __html: module.content.html }} />
          ) : module.content.blocks ? (
            <div dangerouslySetInnerHTML={renderContent(module.content)} />
          ) : (
            <div dangerouslySetInnerHTML={renderContent(module.content)} />
          )}
        </div>
      )}
      
      {module.type !== "landing" && module.type !== "celebration" && (
        <Alert className="bg-blue-50 border-blue-200 my-6">
          <Info className="h-5 w-5 text-blue-500" />
          <AlertTitle className="text-blue-700">Importante</AlertTitle>
          <AlertDescription className="text-blue-600">
            Complete as ações sugeridas neste módulo antes de prosseguir. Você pode voltar a qualquer momento para revisar as instruções.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

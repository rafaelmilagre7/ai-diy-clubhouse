
import React from "react";
import { SafeHtmlRenderer } from "@/components/security/SafeHtmlRenderer";

interface ContentRendererProps {
  content: any;
}

export const ContentRenderer = ({ content }: ContentRendererProps) => {
  // Função para processar conteúdo HTML seguro garantindo contraste correto
  const processSafeHTML = (htmlContent: string) => {
    if (!htmlContent) return "";
    
    // Adiciona classes Tailwind para melhorar contraste no tema escuro - cores mais claras
    let processedHtml = htmlContent
      .replace(/<h1/g, '<h1 class="text-neutral-100 text-2xl font-semibold mb-4"')
      .replace(/<h2/g, '<h2 class="text-neutral-100 text-xl font-semibold mb-3"')
      .replace(/<h3/g, '<h3 class="text-neutral-100 text-lg font-semibold mb-2"')
      .replace(/<h4/g, '<h4 class="text-neutral-100 font-semibold mb-2"')
      .replace(/<h5/g, '<h5 class="text-neutral-100 font-medium mb-2"')
      .replace(/<h6/g, '<h6 class="text-neutral-100 font-medium mb-2"')
      .replace(/<p/g, '<p class="text-neutral-200 mb-4"')
      .replace(/<ul/g, '<ul class="list-disc pl-5 mb-4 text-neutral-200"')
      .replace(/<ol/g, '<ol class="list-decimal pl-5 mb-4 text-neutral-200"')
      .replace(/<li/g, '<li class="mb-1 text-neutral-200"')
      .replace(/<a /g, '<a class="text-viverblue hover:text-viverblue-light underline" ')
      .replace(/<blockquote/g, '<blockquote class="pl-4 border-l-2 border-viverblue/30 italic text-neutral-300 my-4"')
      .replace(/<pre/g, '<pre class="bg-[#0F111A] p-4 rounded-md overflow-auto text-neutral-200 my-4"')
      .replace(/<code/g, '<code class="font-mono text-neutral-200 bg-[#1A1E2E] px-1 rounded"');
    
    return processedHtml;
  };

  // Renderiza conteúdo baseado no tipo
  const renderContent = () => {
    try {
      if (typeof content === "string") {
        return <SafeHtmlRenderer html={processSafeHTML(content)} />;
      }
      
      if (content?.html) {
        return <SafeHtmlRenderer html={processSafeHTML(content.html)} />;
      }
      
      if (content?.text) {
        return <div className="text-neutral-200 whitespace-pre-wrap">{content.text}</div>;
      }
      
      if (content?.overview) {
        return <SafeHtmlRenderer html={processSafeHTML(content.overview)} />;
      }

      return <p className="text-neutral-200">Conteúdo não disponível.</p>;
    } catch (error) {
      console.error("Erro ao renderizar conteúdo:", error);
      return <p className="text-red-400">Erro ao renderizar o conteúdo.</p>;
    }
  };

  return (
    <div className="prose prose-invert max-w-none">
      {renderContent()}
    </div>
  );
};

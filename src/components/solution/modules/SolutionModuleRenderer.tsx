
import React from "react";
import { SolutionBlockRenderer } from "./SolutionBlockRenderer";

interface SolutionModuleRendererProps {
  content: any;
}

export const SolutionModuleRenderer = ({ content }: SolutionModuleRendererProps) => {
  // Se o conteúdo é uma string, exibir como texto simples
  if (typeof content === 'string') {
    return (
      <div className="prose prose-invert max-w-none">
        <p className="text-textSecondary whitespace-pre-wrap">{content}</p>
      </div>
    );
  }

  // Se tem blocks, renderizar como estrutura de blocos
  if (content?.blocks && Array.isArray(content.blocks)) {
    return (
      <div className="space-y-6">
        {content.blocks.map((block: any, index: number) => (
          <SolutionBlockRenderer key={index} block={block} />
        ))}
      </div>
    );
  }

  // Se é um objeto genérico, tentar renderizar as propriedades
  if (typeof content === 'object' && content !== null) {
    return (
      <div className="space-y-4">
        {Object.entries(content).map(([key, value]) => (
          <div key={key}>
            <h5 className="font-medium text-textPrimary mb-2 capitalize">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </h5>
            <div className="text-textSecondary">
              {typeof value === 'string' ? (
                <p className="whitespace-pre-wrap">{value}</p>
              ) : (
                <pre className="text-xs bg-backgroundDark p-2 rounded overflow-auto">
                  {JSON.stringify(value, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 text-center text-textSecondary">
      <p>Formato de conteúdo não reconhecido.</p>
    </div>
  );
};

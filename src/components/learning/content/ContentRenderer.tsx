
import React from "react";
import { ContentBlock } from "@/components/admin/solution/editor/BlockTypes";
import { HeaderBlock } from "./blocks/HeaderBlock";
import { ParagraphBlock } from "./blocks/ParagraphBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { ListBlock } from "./blocks/ListBlock";
import { QuoteBlock } from "./blocks/QuoteBlock";
import { VideoBlock } from "./blocks/VideoBlock";
import { YoutubeBlock } from "./blocks/YoutubeBlock";
import { CodeBlock } from "./blocks/CodeBlock";
import { ChecklistBlock } from "./blocks/ChecklistBlock";
import { WarningBlock } from "./blocks/WarningBlock";

interface ContentRendererProps {
  content: any;
  onInteraction?: () => void;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({ content, onInteraction }) => {
  // Se não houver conteúdo, exibir mensagem de estado vazio
  if (!content) {
    return (
      <div className="p-6 text-center border rounded-md bg-muted/10">
        <p className="text-muted-foreground">Nenhum conteúdo disponível para esta aula.</p>
      </div>
    );
  }

  // Se o conteúdo for uma string, renderizar como HTML (conteúdo legado)
  if (typeof content === "string") {
    return (
      <div 
        className="prose prose-slate max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Se o conteúdo tiver a estrutura de blocos do Editor.js
  if (content.blocks && Array.isArray(content.blocks)) {
    return (
      <div className="space-y-2">
        {content.blocks.map((block: ContentBlock, index: number) => (
          <BlockRenderer 
            key={block.id || index} 
            block={block} 
            onInteraction={onInteraction}
          />
        ))}
      </div>
    );
  }

  // Fallback para objeto JSON
  return (
    <div className="prose prose-slate max-w-none dark:prose-invert">
      <pre className="p-4 bg-muted rounded-md overflow-auto">
        {JSON.stringify(content, null, 2)}
      </pre>
    </div>
  );
};

interface BlockRendererProps {
  block: ContentBlock;
  onInteraction?: () => void;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ block, onInteraction }) => {
  const { type, data } = block;

  if (!type || !data) {
    return null;
  }

  const handleInteraction = () => {
    if (onInteraction) {
      onInteraction();
    }
  };

  // Usamos type assertion (as) para resolver problemas de tipagem
  switch (type) {
    case "header":
      return <HeaderBlock data={data as import("@/components/admin/solution/editor/BlockTypes").HeaderBlockData} />;
    case "paragraph":
      return <ParagraphBlock data={data as import("@/components/admin/solution/editor/BlockTypes").ParagraphBlockData} />;
    case "image":
      return <ImageBlock data={data as import("@/components/admin/solution/editor/BlockTypes").ImageBlockData} />;
    case "list":
      return <ListBlock data={data as import("@/components/admin/solution/editor/BlockTypes").ListBlockData} />;
    case "quote":
      return <QuoteBlock data={data as import("@/components/admin/solution/editor/BlockTypes").QuoteBlockData} />;
    case "video":
      return <VideoBlock data={data as import("@/components/admin/solution/editor/BlockTypes").VideoBlockData} onVideoInteraction={handleInteraction} />;
    case "youtube":
      return <YoutubeBlock data={data as import("@/components/admin/solution/editor/BlockTypes").YoutubeBlockData} onVideoInteraction={handleInteraction} />;
    case "code":
      return <CodeBlock data={data as import("@/components/admin/solution/editor/BlockTypes").CodeBlockData} />;
    case "checklist":
      return <ChecklistBlock data={data as import("@/components/admin/solution/editor/BlockTypes").ChecklistBlockData} />;
    case "warning":
      return <WarningBlock data={data as import("@/components/admin/solution/editor/BlockTypes").WarningBlockData} />;
    default:
      return (
        <div className="p-4 bg-muted/20 border rounded-md my-4">
          <p className="text-sm text-muted-foreground">
            Bloco não suportado: {type}
          </p>
        </div>
      );
  }
};

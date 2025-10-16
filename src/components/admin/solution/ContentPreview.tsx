
import React from "react";
import { cn } from "@/lib/utils";

interface ContentPreviewProps {
  content: any;
  className?: string;
  isJson?: boolean; // Added this prop
}

const ContentPreview = ({ content, className, isJson = false }: ContentPreviewProps) => {
  if (isJson) {
    try {
      // Try to parse the content as JSON if isJson is true
      const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
      
      return (
        <div className={cn("space-y-2", className)}>
          {Array.isArray(parsedContent) ? (
            parsedContent.map((item, index) => (
              <div key={index} className="bg-card p-3 rounded-md border">
                {Object.entries(item).map(([key, value]) => (
                  <div key={key} className="flex flex-col mb-1">
                    <span className="text-sm font-medium capitalize">{key}:</span>
                    <span className="text-sm text-muted-foreground">{String(value)}</span>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              JSON inválido ou vazio
            </div>
          )}
        </div>
      );
    } catch (error) {
      return (
        <div className="text-center py-6 text-destructive">
          Erro ao processar JSON: {String(error)}
        </div>
      );
    }
  }

  if (!content || !content.blocks || content.blocks.length === 0) {
    return (
      <div className={cn("text-center py-6 text-muted-foreground", className)}>
        Sem conteúdo para exibir
      </div>
    );
  }

  return (
    <div className={cn("prose max-w-full", className)}>
      {content.blocks.map((block: any, index: number) => (
        <React.Fragment key={block.id || index}>
          {renderBlock(block)}
        </React.Fragment>
      ))}
    </div>
  );
};

const renderBlock = (block: any) => {
  const { type, data } = block;

  switch (type) {
    case 'header':
      return React.createElement(
        `h${data.level || 2}`,
        { className: "mt-6 mb-2 font-bold" },
        data.text
      );
    
    case 'paragraph':
      return <p className="my-4">{data.text}</p>;
    
    case 'image':
      return (
        <figure className="my-4">
          <img
            src={data.url}
            alt={data.alt || data.caption || 'Imagem'}
            className="rounded mx-auto max-w-full"
          />
          {data.caption && (
            <figcaption className="text-center text-sm text-muted-foreground mt-2">
              {data.caption}
            </figcaption>
          )}
        </figure>
      );
    
    case 'list':
      return (
        <ul className="list-disc pl-6 my-4 space-y-1">
          {data.items.map((item: string, i: number) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    
    case 'video':
      return (
        <figure className="my-4">
          <video
            src={data.url}
            controls
            className="rounded mx-auto max-w-full"
          />
          {data.caption && (
            <figcaption className="text-center text-sm text-muted-foreground mt-2">
              {data.caption}
            </figcaption>
          )}
        </figure>
      );
    
    case 'youtube':
      return (
        <figure className="my-4">
          <div className="relative pb-[56.25%] h-0">
            <iframe
              src={`https://www.youtube.com/embed/${data.youtubeId}`}
              className="absolute top-0 left-0 w-full h-full rounded"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {data.caption && (
            <figcaption className="text-center text-sm text-muted-foreground mt-2">
              {data.caption}
            </figcaption>
          )}
        </figure>
      );
    
    case 'code':
      return (
        <div className="my-4">
          <div className="bg-muted px-2 py-1 text-xs rounded-t border border-border">
            {data.language}
          </div>
          <pre className="bg-card border border-t-0 border-border p-4 rounded-b overflow-x-auto">
            <code>{data.code}</code>
          </pre>
        </div>
      );
    
    case 'quote':
      return (
        <blockquote className="border-l-4 border-aurora-primary pl-4 my-4 italic">
          <p>{data.text}</p>
          {data.caption && (
            <footer className="text-right text-sm text-muted-foreground mt-2">
              — {data.caption}
            </footer>
          )}
        </blockquote>
      );
    
    default:
      return null;
  }
};

export default ContentPreview;

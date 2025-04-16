
import React from "react";
import { useLogging } from "@/hooks/useLogging";

interface ModuleContentTextProps {
  content: any;
}

export const ModuleContentText = ({ content }: ModuleContentTextProps) => {
  const { log, logError } = useLogging();
  
  if (!content) {
    log("ModuleContentText: No content provided", { content });
    return null;
  }
  
  const renderHtmlContent = () => {
    try {
      if (content.html) {
        log("ModuleContentText: Rendering HTML content");
        return { __html: content.html };
      }
      
      if (content.blocks && Array.isArray(content.blocks)) {
        log("ModuleContentText: Rendering blocks content", { 
          blockCount: content.blocks.length,
          blockTypes: content.blocks.map((b: any) => b.type)
        });
        
        // Parse content from Editor.js blocks
        const htmlContent = content.blocks.map((block: any) => {
          switch (block.type) {
            case "paragraph":
              return `<p>${block.data.text}</p>`;
            case "header":
              return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
            case "list":
              const listItems = block.data.items.map((item: string) => `<li>${item}</li>`).join('');
              return block.data.style === 'ordered' ? `<ol>${listItems}</ol>` : `<ul>${listItems}</ul>`;
            case "image":
              return `<figure class="my-4">
                <img src="${block.data.url}" alt="${block.data.caption || ''}" class="rounded-lg max-w-full mx-auto" />
                ${block.data.caption ? `<figcaption class="text-center text-sm text-muted-foreground mt-2">${block.data.caption}</figcaption>` : ''}
              </figure>`;
            case "quote":
              return `<blockquote class="p-4 border-l-4 border-gray-200 my-4">
                <p class="italic">${block.data.text}</p>
                ${block.data.caption ? `<footer class="text-right text-sm text-muted-foreground mt-2">— ${block.data.caption}</footer>` : ''}
              </blockquote>`;
            case "code":
              return `<pre class="bg-gray-100 p-4 rounded-md overflow-x-auto my-4"><code>${block.data.code}</code></pre>`;
            case "checklist":
              const checklistItems = block.data.items.map((item: any) => 
                `<div class="flex items-start my-1">
                  <div class="flex-shrink-0 ${item.checked ? 'text-green-500' : 'text-gray-400'}">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="${item.checked ? 'M5 13l4 4L19 7' : 'M9 12l2 2 4-4'}" />
                    </svg>
                  </div>
                  <span class="ml-2">${item.text}</span>
                </div>`
              ).join('');
              return `<div class="my-4">${checklistItems}</div>`;
            default:
              return "";
          }
        }).join("");
        
        return { __html: htmlContent };
      }
      
      // Fallback for string content
      if (typeof content === "string") {
        log("ModuleContentText: Rendering string content");
        return { __html: content };
      }
      
      // Fallback for object content (try to display something useful)
      if (typeof content === "object") {
        log("ModuleContentText: Rendering object content as string", { contentKeys: Object.keys(content) });
        const fallbackContent = content.text || content.description || content.title || JSON.stringify(content);
        return { __html: `<p>${fallbackContent}</p>` };
      }
      
      log("ModuleContentText: Unknown content format", { contentType: typeof content });
      return { __html: "" };
    } catch (error) {
      logError("Error rendering content", error);
      return { __html: "<p>Erro ao renderizar conteúdo</p>" };
    }
  };

  return (
    <div className="prose prose-blue max-w-none">
      <div dangerouslySetInnerHTML={renderHtmlContent()} />
    </div>
  );
};

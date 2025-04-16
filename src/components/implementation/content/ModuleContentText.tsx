
import React from "react";

interface ModuleContentTextProps {
  content: any;
}

export const ModuleContentText = ({ content }: ModuleContentTextProps) => {
  const renderHtmlContent = () => {
    if (content.html) {
      return { __html: content.html };
    }
    
    if (content.blocks && Array.isArray(content.blocks)) {
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
          default:
            return "";
        }
      }).join("");
      
      return { __html: htmlContent };
    }
    
    // Fallback for string content
    if (typeof content === "string") {
      return { __html: content };
    }
    
    return { __html: "" };
  };

  return (
    <div className="prose prose-blue max-w-none">
      <div dangerouslySetInnerHTML={renderHtmlContent()} />
    </div>
  );
};

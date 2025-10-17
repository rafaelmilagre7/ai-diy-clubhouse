
import React from 'react';
import { SafeHTML } from '@/utils/security/xssProtection';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const renderMarkdown = (text: string): string => {
    let html = text;
    
    // Imagens: ![alt](url) -> <img> com estilos melhorados
    html = html.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0; border: 1px solid hsl(var(--border)); display: block;" loading="lazy" />'
    );
    
    // Links: [text](url) -> <a>
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-primary underline" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    
    // Negrito: **text** -> <strong>
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    
    // Itálico: *text* -> <em>
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    
    // Sublinhado: __text__ -> <u>
    html = html.replace(/__(.*?)__/g, '<u class="underline">$1</u>');
    
    // Código inline: `code` -> <code>
    html = html.replace(
      /`([^`]+)`/g, 
      '<code class="bg-muted text-foreground px-1.5 py-0.5 rounded text-sm font-mono">$1</code>'
    );
    
    // Quebras de linha -> <br>
    html = html.replace(/\n/g, '<br>');
    
    return html;
  };

  return (
    <SafeHTML 
      html={renderMarkdown(content)}
      className={`prose prose-sm max-w-none ${className}`}
      sanitizationLevel="comments"
    />
  );
};

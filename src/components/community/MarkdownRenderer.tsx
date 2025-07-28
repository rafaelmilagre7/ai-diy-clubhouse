
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
      '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0; border: 1px solid #e2e8f0; display: block;" loading="lazy" />'
    );
    
    // Links: [text](url) -> <a>
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" style="color: #3b82f6; text-decoration: underline;" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    
    // Negrito: **text** -> <strong>
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>');
    
    // Itálico: *text* -> <em>
    html = html.replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>');
    
    // Sublinhado: __text__ -> <u>
    html = html.replace(/__(.*?)__/g, '<u style="text-decoration: underline;">$1</u>');
    
    // Código inline: `code` -> <code>
    html = html.replace(
      /`([^`]+)`/g, 
      '<code style="background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 14px; font-family: monospace;">$1</code>'
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

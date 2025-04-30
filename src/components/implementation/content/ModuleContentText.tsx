
import React from "react";
import { useLogging } from "@/hooks/useLogging";
import { ContentRenderer } from "@/components/learning/content/ContentRenderer";

interface ModuleContentTextProps {
  content: any;
}

export const ModuleContentText = ({ content }: ModuleContentTextProps) => {
  const { log, logError } = useLogging();
  
  if (!content) {
    log("ModuleContentText: No content provided", { content });
    return null;
  }
  
  try {
    return <ContentRenderer content={content} />;
  } catch (error) {
    logError("Error rendering content", error);
    return (
      <div className="prose prose-blue max-w-none">
        <p>Erro ao renderizar conteúdo</p>
      </div>
    );
  }
};

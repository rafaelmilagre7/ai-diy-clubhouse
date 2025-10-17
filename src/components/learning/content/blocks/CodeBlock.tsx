
import React from "react";
import { CodeBlockData } from "@/components/admin/solution/editor/BlockTypes";

interface CodeBlockProps {
  data: CodeBlockData;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ data }) => {
  const { code, language } = data;
  
  return (
    <div className="my-6">
      <div className="bg-card text-foreground rounded-t-md px-4 py-2 text-sm font-mono">
        {language || "code"}
      </div>
      <pre className="bg-muted text-foreground rounded-b-md p-4 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};

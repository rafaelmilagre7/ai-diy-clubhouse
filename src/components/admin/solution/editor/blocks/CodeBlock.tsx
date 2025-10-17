
import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface CodeBlockProps {
  data: {
    code: string;
    language: string;
  };
  onChange: (data: any) => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <select
          className="border rounded px-2 py-1 text-sm"
          value={data.language}
          onChange={(e) => onChange({ language: e.target.value })}
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="json">JSON</option>
          <option value="python">Python</option>
          <option value="php">PHP</option>
        </select>
      </div>
      <Textarea
        value={data.code}
        onChange={(e) => onChange({ code: e.target.value })}
        placeholder="Código aqui..."
        className="min-h-chart-sm"
      />
    </div>
  );
};

export default CodeBlock;


import React from "react";

interface CodePreviewProps {
  data: {
    code: string;
    language: string;
  };
}

const CodePreview: React.FC<CodePreviewProps> = ({ data }) => {
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
};

export default CodePreview;

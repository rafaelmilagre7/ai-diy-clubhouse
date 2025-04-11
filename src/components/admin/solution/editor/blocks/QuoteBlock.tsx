
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface QuoteBlockProps {
  data: {
    text: string;
    caption?: string;
  };
  onChange: (data: any) => void;
}

const QuoteBlock: React.FC<QuoteBlockProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-2">
      <Textarea
        value={data.text}
        onChange={(e) => onChange({ text: e.target.value })}
        placeholder="Citação..."
        className="min-h-[100px]"
      />
      <Input
        value={data.caption || ''}
        onChange={(e) => onChange({ caption: e.target.value })}
        placeholder="Autor ou fonte"
      />
    </div>
  );
};

export default QuoteBlock;


import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface ParagraphBlockProps {
  data: {
    text: string;
  };
  onChange: (data: any) => void;
}

const ParagraphBlock: React.FC<ParagraphBlockProps> = ({ data, onChange }) => {
  return (
    <Textarea
      value={data.text}
      onChange={(e) => onChange({ text: e.target.value })}
      placeholder="Digite seu texto aqui..."
      className="min-h-chart-sm"
    />
  );
};

export default ParagraphBlock;

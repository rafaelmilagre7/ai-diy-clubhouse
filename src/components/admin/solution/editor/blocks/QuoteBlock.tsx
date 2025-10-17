
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Quote } from "lucide-react";

interface QuoteBlockProps {
  data: {
    text: string;
    caption?: string;
  };
  onChange: (data: any) => void;
}

const QuoteBlock: React.FC<QuoteBlockProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-4">
      <Textarea
        value={data.text}
        onChange={(e) => onChange({ ...data, text: e.target.value })}
        placeholder="Citação..."
        className="min-h-[120px]"
      />
      <Input
        value={data.caption || ''}
        onChange={(e) => onChange({ ...data, caption: e.target.value })}
        placeholder="Autor ou fonte"
      />
      
      <div className="mt-4 p-6 border border-border bg-muted rounded-lg">
        <div className="relative">
          <Quote className="absolute top-0 left-0 h-6 w-6 text-operational -translate-x-2 -translate-y-2" />
          <blockquote className="pl-6 pt-2 italic text-foreground text-lg">
            "{data.text || "Sua citação aparecerá aqui..."}"
          </blockquote>
          {data.caption && (
            <p className="mt-3 text-right text-sm text-muted-foreground">
              — {data.caption}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteBlock;

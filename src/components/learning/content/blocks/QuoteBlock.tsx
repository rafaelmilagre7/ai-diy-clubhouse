
import React from "react";
import { QuoteBlockData } from "@/components/admin/solution/editor/BlockTypes";

interface QuoteBlockProps {
  data: QuoteBlockData;
}

export const QuoteBlock: React.FC<QuoteBlockProps> = ({ data }) => {
  const { text, caption } = data;
  
  return (
    <blockquote className="my-6 border-l-4 border-primary pl-4 py-2 bg-primary/5 rounded">
      <p className="italic text-foreground">{text}</p>
      {caption && (
        <footer className="text-right text-sm text-muted-foreground mt-2">
          — {caption}
        </footer>
      )}
    </blockquote>
  );
};

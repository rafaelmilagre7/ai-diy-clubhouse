
import React from "react";

interface QuotePreviewProps {
  data: {
    text: string;
    caption?: string;
  };
}

const QuotePreview: React.FC<QuotePreviewProps> = ({ data }) => {
  return (
    <blockquote className="border-l-4 border-aurora-primary pl-4 my-4 italic">
      <p>{data.text}</p>
      {data.caption && (
        <footer className="text-right text-sm text-muted-foreground mt-2">
          — {data.caption}
        </footer>
      )}
    </blockquote>
  );
};

export default QuotePreview;

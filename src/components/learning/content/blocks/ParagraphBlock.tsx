
import React from "react";
import { ParagraphBlockData } from "@/components/admin/solution/editor/BlockTypes";

interface ParagraphBlockProps {
  data: ParagraphBlockData;
}

export const ParagraphBlock: React.FC<ParagraphBlockProps> = ({ data }) => {
  const { text } = data;
  
  return (
    <p className="text-base leading-relaxed mb-4 text-gray-800 dark:text-gray-200">
      {text}
    </p>
  );
};

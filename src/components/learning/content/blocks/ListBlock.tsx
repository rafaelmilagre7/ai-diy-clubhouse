
import React from "react";
import { ListBlockData } from "@/components/admin/solution/editor/BlockTypes";

interface ListBlockProps {
  data: ListBlockData;
  listType?: "ordered" | "unordered";
}

export const ListBlock: React.FC<ListBlockProps> = ({ data, listType = "unordered" }) => {
  const { items } = data;
  
  if (!items || !items.length) {
    return null;
  }
  
  if (listType === "ordered") {
    return (
      <ol className="list-decimal pl-6 mb-4 space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-foreground">
            {item}
          </li>
        ))}
      </ol>
    );
  }
  
  return (
    <ul className="list-disc pl-6 mb-4 space-y-2">
      {items.map((item, index) => (
        <li key={index} className="text-foreground">
          {item}
        </li>
      ))}
    </ul>
  );
};


import React from "react";

interface ListPreviewProps {
  data: {
    items: string[];
  };
}

const ListPreview: React.FC<ListPreviewProps> = ({ data }) => {
  return (
    <ul className="list-disc pl-6 my-4 space-y-1">
      {data.items.map((item: string, i: number) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
};

export default ListPreview;

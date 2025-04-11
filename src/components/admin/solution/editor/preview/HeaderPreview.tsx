
import React from "react";

interface HeaderPreviewProps {
  data: {
    text: string;
    level: number;
  };
}

const HeaderPreview: React.FC<HeaderPreviewProps> = ({ data }) => {
  const Tag = `h${data.level}` as keyof JSX.IntrinsicElements;
  
  return React.createElement(
    Tag,
    { className: "mt-6 mb-2 font-bold" },
    data.text
  );
};

export default HeaderPreview;

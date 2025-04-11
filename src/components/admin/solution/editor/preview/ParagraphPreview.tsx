
import React from "react";

interface ParagraphPreviewProps {
  data: {
    text: string;
  };
}

const ParagraphPreview: React.FC<ParagraphPreviewProps> = ({ data }) => {
  return <p className="my-4">{data.text}</p>;
};

export default ParagraphPreview;

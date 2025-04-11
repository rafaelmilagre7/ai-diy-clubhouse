
import React from "react";
import { ParagraphBlockData } from "../BlockTypes";

interface ParagraphPreviewProps {
  data: ParagraphBlockData;
}

const ParagraphPreview: React.FC<ParagraphPreviewProps> = ({ data }) => {
  return <p className="my-4">{data.text}</p>;
};

export default ParagraphPreview;

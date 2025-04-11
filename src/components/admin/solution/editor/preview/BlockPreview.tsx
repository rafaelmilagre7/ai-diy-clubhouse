
import React from "react";
import { ContentBlock } from "../BlockTypes";
import HeaderPreview from "./HeaderPreview";
import ParagraphPreview from "./ParagraphPreview";
import ImagePreview from "./ImagePreview";
import ListPreview from "./ListPreview";
import VideoPreview from "./VideoPreview";
import YoutubePreview from "./YoutubePreview";
import CodePreview from "./CodePreview";
import QuotePreview from "./QuotePreview";

interface BlockPreviewProps {
  block: ContentBlock;
}

const BlockPreview: React.FC<BlockPreviewProps> = ({ block }) => {
  const { type, data } = block;

  switch (type) {
    case 'header':
      return <HeaderPreview data={data} />;
    case 'paragraph':
      return <ParagraphPreview data={data} />;
    case 'image':
      return <ImagePreview data={data} />;
    case 'list':
      return <ListPreview data={data} />;
    case 'video':
      return <VideoPreview data={data} />;
    case 'youtube':
      return <YoutubePreview data={data} />;
    case 'code':
      return <CodePreview data={data} />;
    case 'quote':
      return <QuotePreview data={data} />;
    default:
      return <div>Tipo de bloco desconhecido: {type}</div>;
  }
};

export default BlockPreview;

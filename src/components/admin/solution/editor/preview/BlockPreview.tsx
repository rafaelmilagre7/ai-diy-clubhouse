
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
      return <HeaderPreview data={data as { text: string; level: number }} />;
    case 'paragraph':
      return <ParagraphPreview data={data as { text: string }} />;
    case 'image':
      return <ImagePreview data={data as { url: string; alt?: string; caption?: string }} />;
    case 'list':
      return <ListPreview data={data as { items: string[] }} />;
    case 'video':
      return <VideoPreview data={data as { url: string; caption?: string }} />;
    case 'youtube':
      return <YoutubePreview data={data as { youtubeId: string; caption?: string }} />;
    case 'code':
      return <CodePreview data={data as { code: string; language: string }} />;
    case 'quote':
      return <QuotePreview data={data as { text: string; caption?: string }} />;
    default:
      return <div>Tipo de bloco desconhecido: {type}</div>;
  }
};

export default BlockPreview;

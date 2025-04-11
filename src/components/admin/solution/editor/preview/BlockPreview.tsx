
import React from "react";
import { ContentBlock, HeaderBlockData, ParagraphBlockData, ImageBlockData, ListBlockData, VideoBlockData, YoutubeBlockData, CodeBlockData, QuoteBlockData } from "../BlockTypes";
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
      return <HeaderPreview data={data as HeaderBlockData} />;
    case 'paragraph':
      return <ParagraphPreview data={data as ParagraphBlockData} />;
    case 'image':
      return <ImagePreview data={data as ImageBlockData} />;
    case 'list':
      return <ListPreview data={data as ListBlockData} />;
    case 'video':
      return <VideoPreview data={data as VideoBlockData} />;
    case 'youtube':
      return <YoutubePreview data={data as YoutubeBlockData} />;
    case 'code':
      return <CodePreview data={data as CodeBlockData} />;
    case 'quote':
      return <QuotePreview data={data as QuoteBlockData} />;
    default:
      return <div>Tipo de bloco desconhecido: {type}</div>;
  }
};

export default BlockPreview;

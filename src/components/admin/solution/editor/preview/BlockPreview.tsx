
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
import ChecklistPreview from "./ChecklistPreview";
import StepsPreview from "./StepsPreview";
import WarningPreview from "./WarningPreview";
import BenefitsPreview from "./BenefitsPreview";
import MetricsPreview from "./MetricsPreview";
import TipsPreview from "./TipsPreview";
import CTAPreview from "./CTAPreview";

interface BlockPreviewProps {
  block: ContentBlock;
}

const BlockPreview: React.FC<BlockPreviewProps> = ({ block }) => {
  const { type, data } = block;

  switch (type) {
    case "header":
      return <HeaderPreview data={data} />;
    case "paragraph":
      return <ParagraphPreview data={data} />;
    case "image":
      return <ImagePreview data={data} />;
    case "list":
      return <ListPreview data={data} />;
    case "video":
      return <VideoPreview data={data} />;
    case "youtube":
      return <YoutubePreview data={data} />;
    case "code":
      return <CodePreview data={data} />;
    case "quote":
      return <QuotePreview data={data} />;
    case "checklist":
      return <ChecklistPreview data={data} />;
    case "steps":
      return <StepsPreview data={data} />;
    case "warning":
      return <WarningPreview data={data} />;
    case "benefits":
      return <BenefitsPreview data={data} />;
    case "metrics":
      return <MetricsPreview data={data} />;
    case "tips":
      return <TipsPreview data={data} />;
    case "cta":
      return <CTAPreview data={data} />;
    default:
      return (
        <div className="bg-muted p-4 rounded my-4">
          <p className="text-muted-foreground">
            Bloco de tipo desconhecido: {type}
          </p>
        </div>
      );
  }
};

export default BlockPreview;

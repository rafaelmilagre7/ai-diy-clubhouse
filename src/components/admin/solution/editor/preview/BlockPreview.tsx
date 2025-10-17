
import React from "react";
import { ContentBlock } from "../BlockTypes";
import HeaderPreview from "./HeaderPreview";
import ParagraphPreview from "./ParagraphPreview";
import ImagePreview from "./ImagePreview";
import ListPreview from "./ListPreview";
import VideoPreview from "./VideoPreview";

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

  // Type safety check
  if (!type || !data) {
    return (
      <div className="bg-status-error/10 p-4 rounded my-4 border border-status-error/30">
        <p className="text-status-error">
          Bloco inválido: faltando tipo ou dados
        </p>
      </div>
    );
  }

  switch (type) {
    case "header":
      return <HeaderPreview data={data as { text: string; level: number }} />;
    case "paragraph":
      return <ParagraphPreview data={data as { text: string }} />;
    case "image":
      return <ImagePreview data={data as { url: string; alt?: string; caption?: string }} />;
    case "list":
      return <ListPreview data={data as { items: string[] }} />;
    case "video":
      return <VideoPreview data={data as { url: string; caption?: string }} />;
    case "code":
      return <CodePreview data={data as { code: string; language: string }} />;
    case "quote":
      return <QuotePreview data={data as { text: string; caption?: string }} />;
    case "checklist":
      return <ChecklistPreview data={data as { items: { text: string; checked: boolean }[] }} />;
    case "steps":
      return <StepsPreview data={data as { title: string; steps: { title: string; description: string; imageUrl: string }[] }} />;
    case "warning":
      return <WarningPreview data={data as { title: string; text: string }} />;
    case "benefits":
      return <BenefitsPreview data={data as { title: string; items: string[] }} />;
    case "metrics":
      return <MetricsPreview data={data as { title: string; description: string; metrics: { label: string; value: string; unit: string }[] }} />;
    case "tips":
      return <TipsPreview data={data as { title: string; items: string[] }} />;
    case "cta":
      return <CTAPreview data={data as { title: string; text: string; buttonText: string; buttonLink: string }} />;
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

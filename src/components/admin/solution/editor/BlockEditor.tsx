
import React from "react";
import { ContentBlock } from "./BlockTypes";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import HeaderBlock from "./blocks/HeaderBlock";
import ParagraphBlock from "./blocks/ParagraphBlock";
import ListBlock from "./blocks/ListBlock";
import ImageBlock from "./blocks/ImageBlock";
import VideoBlock from "./blocks/VideoBlock";

import QuoteBlock from "./blocks/QuoteBlock";
import CodeBlock from "./blocks/CodeBlock";
import ChecklistBlock from "./blocks/ChecklistBlock";
import StepsBlock from "./blocks/StepsBlock";
import WarningBlock from "./blocks/WarningBlock";
import BenefitsBlock from "./blocks/BenefitsBlock";
import MetricsBlock from "./blocks/MetricsBlock";
import TipsBlock from "./blocks/TipsBlock";
import CTABlock from "./blocks/CTABlock";
import { getBlockIcon, BlockType } from "./BlockIcons";

interface BlockEditorProps {
  block: ContentBlock;
  index: number;
  onUpdate: (index: number, data: Record<string, any>) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: "up" | "down") => void;
  isFirst: boolean;
  isLast: boolean;
}

const BlockEditor: React.FC<BlockEditorProps> = ({
  block,
  index,
  onUpdate,
  onRemove,
  onMove,
  isFirst,
  isLast,
}) => {
  const { type, data } = block;

  // Renderiza o editor apropriado com base no tipo de bloco
  const renderBlockEditor = () => {
    switch (type as BlockType) {
      case "header":
        return (
          <HeaderBlock
            data={data as { text: string; level: number }}
            onChange={(newData) => onUpdate(index, newData)}
          />
        );
      case "paragraph":
        return (
          <ParagraphBlock
            data={data as { text: string }}
            onChange={(newData) => onUpdate(index, newData)}
          />
        );
      case "list":
        return (
          <ListBlock
            data={data as { items: string[] }}
            onChange={(newData) => onUpdate(index, newData)}
          />
        );
      case "image":
        return (
          <ImageBlock
            data={data as { url: string; alt?: string; caption?: string }}
            onChange={(newData) => onUpdate(index, newData)}
          />
        );
      case "video":
        return (
          <VideoBlock
            data={data as { url: string; caption?: string }}
            onChange={(newData) => onUpdate(index, newData)}
          />
        );
      case "quote":
        return (
          <QuoteBlock
            data={data as { text: string; caption?: string }}
            onChange={(newData) => onUpdate(index, newData)}
          />
        );
      case "code":
        return (
          <CodeBlock
            data={data as { code: string; language: string }}
            onChange={(newData) => onUpdate(index, newData)}
          />
        );
      case "checklist":
        return (
          <ChecklistBlock
            data={data as { items: { text: string; checked: boolean }[] }}
            onChange={(newData) => onUpdate(index, newData)}
          />
        );
      case "steps":
        return (
          <StepsBlock
            data={data as { title: string; steps: { title: string; description: string; imageUrl: string }[] }}
            onChange={(newData) => onUpdate(index, newData)}
          />
        );
      case "warning":
        return (
          <WarningBlock
            data={data as { title: string; text: string }}
            onChange={(newData) => onUpdate(index, newData)}
          />
        );
      case "benefits":
        return (
          <BenefitsBlock
            data={data as { title: string; items: string[] }}
            onChange={(newData) => onUpdate(index, newData)}
          />
        );
      case "metrics":
        return (
          <MetricsBlock
            data={data as { title: string; description: string; metrics: { label: string; value: string; unit: string }[] }}
            onChange={(newData) => onUpdate(index, newData)}
          />
        );
      case "tips":
        return (
          <TipsBlock
            data={data as { title: string; items: string[] }}
            onChange={(newData) => onUpdate(index, newData)}
          />
        );
      case "cta":
        return (
          <CTABlock
            data={data as { title: string; text: string; buttonText: string; buttonLink: string }}
            onChange={(newData) => onUpdate(index, newData)}
          />
        );
      default:
        return (
          <div className="p-4 bg-status-error/10 text-status-error rounded-md">
            Tipo de bloco desconhecido: {type}
          </div>
        );
    }
  };

  // Get the icon for the current block type
  const BlockIcon = getBlockIcon(type as BlockType);

  return (
    <Card className="border border-muted relative group">
      <CardHeader className="p-3 flex flex-row items-center justify-between bg-muted/20 border-b">
        <div className="flex items-center gap-2">
          <BlockIcon className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium text-sm capitalize">
            {type === "cta" ? "Call to Action" : type}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMove(index, "up")}
            disabled={isFirst}
            className="h-8 w-8 opacity-60 hover:opacity-100"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMove(index, "down")}
            disabled={isLast}
            className="h-8 w-8 opacity-60 hover:opacity-100"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            className="h-8 w-8 text-status-error opacity-60 hover:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">{renderBlockEditor()}</CardContent>
    </Card>
  );
};

export default BlockEditor;

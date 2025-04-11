
import React from "react";
import { Button } from "@/components/ui/button";
import { ContentBlock } from "./BlockTypes";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, getBlockIcon } from "./BlockIcons";
import HeaderBlock from "./blocks/HeaderBlock";
import ParagraphBlock from "./blocks/ParagraphBlock";
import ImageBlock from "./blocks/ImageBlock";
import ListBlock from "./blocks/ListBlock";
import VideoBlock from "./blocks/VideoBlock";
import YoutubeBlock from "./blocks/YoutubeBlock";
import CodeBlock from "./blocks/CodeBlock";
import QuoteBlock from "./blocks/QuoteBlock";

interface BlockEditorProps {
  block: ContentBlock;
  index: number;
  onUpdate: (index: number, data: any) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
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
  isLast
}) => {
  const { type, data } = block;

  const renderBlockEditor = () => {
    switch (type) {
      case 'header':
        return <HeaderBlock data={data as { text: string; level: number }} onChange={(newData) => onUpdate(index, newData)} />;
      case 'paragraph':
        return <ParagraphBlock data={data as { text: string }} onChange={(newData) => onUpdate(index, newData)} />;
      case 'image':
        return <ImageBlock data={data as { url: string; caption?: string; alt?: string }} onChange={(newData) => onUpdate(index, newData)} />;
      case 'list':
        return <ListBlock data={data as { items: string[] }} onChange={(newData) => onUpdate(index, newData)} />;
      case 'video':
        return <VideoBlock data={data as { url: string; caption?: string }} onChange={(newData) => onUpdate(index, newData)} />;
      case 'youtube':
        return <YoutubeBlock data={data as { youtubeId: string; caption?: string }} onChange={(newData) => onUpdate(index, newData)} />;
      case 'code':
        return <CodeBlock data={data as { code: string; language: string }} onChange={(newData) => onUpdate(index, newData)} />;
      case 'quote':
        return <QuoteBlock data={data as { text: string; caption?: string }} onChange={(newData) => onUpdate(index, newData)} />;
      default:
        return (
          <div className="bg-muted p-4 rounded">
            Tipo de bloco desconhecido: {type}
          </div>
        );
    }
  };

  return (
    <Collapsible className="border rounded-md">
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent">
          <div className="flex items-center">
            {getBlockIcon(type)}
            <span className="ml-2 capitalize">{type}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-4 border-t">
          {renderBlockEditor()}
          
          <div className="flex justify-between mt-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMove(index, 'up')}
                disabled={isFirst}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMove(index, 'down')}
                disabled={isLast}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onRemove(index)}
            >
              Remover
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default BlockEditor;

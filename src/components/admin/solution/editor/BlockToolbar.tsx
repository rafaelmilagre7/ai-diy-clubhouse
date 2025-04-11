
import React from "react";
import { Button } from "@/components/ui/button";
import { Type, FileText, Image, List, Video, Youtube, Code, Quote } from "lucide-react";

interface BlockToolbarProps {
  onAddBlock: (type: string) => void;
}

const BlockToolbar: React.FC<BlockToolbarProps> = ({ onAddBlock }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAddBlock('header')}
      >
        <Type className="h-4 w-4 mr-1" />
        Título
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAddBlock('paragraph')}
      >
        <FileText className="h-4 w-4 mr-1" />
        Parágrafo
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAddBlock('image')}
      >
        <Image className="h-4 w-4 mr-1" />
        Imagem
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAddBlock('list')}
      >
        <List className="h-4 w-4 mr-1" />
        Lista
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAddBlock('video')}
      >
        <Video className="h-4 w-4 mr-1" />
        Vídeo
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAddBlock('youtube')}
      >
        <Youtube className="h-4 w-4 mr-1" />
        YouTube
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAddBlock('code')}
      >
        <Code className="h-4 w-4 mr-1" />
        Código
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAddBlock('quote')}
      >
        <Quote className="h-4 w-4 mr-1" />
        Citação
      </Button>
    </div>
  );
};

export default BlockToolbar;

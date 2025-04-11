
import React from "react";
import { Input } from "@/components/ui/input";

interface YoutubeBlockProps {
  data: {
    youtubeId: string;
    caption?: string;
  };
  onChange: (data: any) => void;
}

const YoutubeBlock: React.FC<YoutubeBlockProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-2">
      <Input
        value={data.youtubeId}
        onChange={(e) => onChange({ youtubeId: e.target.value })}
        placeholder="ID do vídeo do YouTube (ex: dQw4w9WgXcQ)"
      />
      <Input
        value={data.caption || ''}
        onChange={(e) => onChange({ caption: e.target.value })}
        placeholder="Legenda (opcional)"
      />
      {data.youtubeId && (
        <div className="mt-2 border rounded p-2">
          <p className="text-xs text-muted-foreground mb-1">Preview:</p>
          <div className="relative pb-[56.25%] h-0">
            <iframe
              src={`https://www.youtube.com/embed/${data.youtubeId}`}
              className="absolute top-0 left-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default YoutubeBlock;

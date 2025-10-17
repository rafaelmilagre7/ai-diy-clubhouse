
import React from "react";
import { Input } from "@/components/ui/input";

interface VideoBlockProps {
  data: {
    url: string;
    caption?: string;
  };
  onChange: (data: any) => void;
}

const VideoBlock: React.FC<VideoBlockProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-2">
      <Input
        value={data.url}
        onChange={(e) => onChange({ url: e.target.value })}
        placeholder="URL do vídeo (MP4)"
      />
      <Input
        value={data.caption || ''}
        onChange={(e) => onChange({ caption: e.target.value })}
        placeholder="Legenda (opcional)"
      />
      {data.url && (
        <div className="mt-2 border rounded p-2">
          <p className="text-xs text-muted-foreground mb-1">Preview:</p>
          <video 
            src={data.url} 
            controls 
            className="max-h-80 w-full"
          />
        </div>
      )}
    </div>
  );
};

export default VideoBlock;

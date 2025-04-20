
import { VideoTutorial } from '@/types/toolTypes';
import { Card, CardContent } from '@/components/ui/card';
import { YoutubeEmbed } from '@/components/common/YoutubeEmbed';

interface ToolTutorialsProps {
  tutorials?: VideoTutorial[];
}

export const ToolTutorials = ({ tutorials }: ToolTutorialsProps) => {
  if (!tutorials || tutorials.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Não há tutoriais disponíveis para esta ferramenta.</p>
      </div>
    );
  }

  const getYoutubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="grid gap-6 mt-4">
      {tutorials.map((video, index) => (
        <div key={index} className="space-y-2">
          <h3 className="text-lg font-medium">{video.title}</h3>
          <div className="aspect-video overflow-hidden rounded-lg">
            <YoutubeEmbed youtubeId={getYoutubeId(video.url) || ''} title={video.title} />
          </div>
        </div>
      ))}
    </div>
  );
};

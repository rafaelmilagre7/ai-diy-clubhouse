
import { VideoTutorial } from '@/types/toolTypes';
import { Card, CardContent } from '@/components/ui/card';
import { YoutubeEmbed } from '@/components/common/YoutubeEmbed';
import { Play, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ToolTutorialsProps {
  tutorials?: VideoTutorial[];
}

export const ToolTutorials = ({ tutorials }: ToolTutorialsProps) => {
  if (!tutorials || tutorials.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="flex flex-col items-center space-y-3">
          <Play className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Não há tutoriais disponíveis para esta ferramenta.</p>
          <p className="text-sm text-muted-foreground">
            Tutoriais serão adicionados em breve. Você pode acessar o site oficial da ferramenta para mais informações.
          </p>
        </div>
      </div>
    );
  }

  const getYoutubeId = (url: string): string | null => {
    // Regex mais robusta para diferentes formatos de URL do YouTube
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
      /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
      /(?:youtu\.be\/)([^&\n?#]+)/,
      /(?:youtube\.com\/v\/)([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1] && match[1].length === 11) {
        return match[1];
      }
    }
    return null;
  };

  const isYoutubeUrl = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  return (
    <div className="grid gap-6 mt-4">
      {tutorials.map((video, index) => {
        const youtubeId = getYoutubeId(video.url);
        const isYoutube = isYoutubeUrl(video.url);
        
        return (
          <Card key={index} className="bg-backgroundLight border-white/10">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-textPrimary">{video.title}</h3>
                    {video.description && (
                      <p className="text-sm text-textSecondary mt-1">{video.description}</p>
                    )}
                  </div>
                  {!isYoutube && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(video.url, '_blank')}
                      className="flex-shrink-0 ml-4"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Assistir
                    </Button>
                  )}
                </div>
                
                {isYoutube && youtubeId ? (
                  <div className="aspect-video overflow-hidden rounded-lg bg-black">
                    <YoutubeEmbed youtubeId={youtubeId} title={video.title} />
                  </div>
                ) : isYoutube ? (
                  <div className="aspect-video overflow-hidden rounded-lg bg-backgroundDark border border-white/10 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Play className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        Não foi possível carregar o vídeo do YouTube
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(video.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Assistir no YouTube
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video overflow-hidden rounded-lg bg-backgroundDark border border-white/10 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Play className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        Tutorial em vídeo externo
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(video.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Assistir Tutorial
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

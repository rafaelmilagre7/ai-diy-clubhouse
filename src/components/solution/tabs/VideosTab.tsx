
import React from "react";
import { Solution } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Play } from "lucide-react";
import { useSolutionVideos } from "@/hooks/useSolutionVideos";
import { VideoItem } from "./components/VideoItem";
import { Skeleton } from "@/components/ui/skeleton";

interface VideosTabProps {
  solution: Solution;
}

export const VideosTab = ({ solution }: VideosTabProps) => {
  const { videos, loading, error } = useSolutionVideos(solution.id);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-[#151823] border border-white/5">
          <CardHeader>
            <CardTitle className="text-neutral-100 flex items-center gap-2">
              <Video className="h-5 w-5 text-viverblue" />
              Vídeos Educacionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-video w-full rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="bg-[#151823] border border-white/5">
          <CardHeader>
            <CardTitle className="text-neutral-100 flex items-center gap-2">
              <Video className="h-5 w-5 text-viverblue" />
              Vídeos Educacionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Play className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-300 mb-2">
                Erro ao carregar vídeos
              </h3>
              <p className="text-neutral-400 max-w-md mx-auto">
                Houve um problema ao carregar os vídeos. Tente novamente mais tarde.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="bg-[#151823] border border-white/5">
          <CardHeader>
            <CardTitle className="text-neutral-100 flex items-center gap-2">
              <Video className="h-5 w-5 text-viverblue" />
              Vídeos Educacionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Play className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-300 mb-2">
                Vídeos em preparação
              </h3>
              <p className="text-neutral-400 max-w-md mx-auto">
                Os vídeos educacionais desta solução estão sendo produzidos. 
                Em breve você terá acesso a conteúdo exclusivo em vídeo!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#151823] border border-white/5">
        <CardHeader>
          <CardTitle className="text-neutral-100 flex items-center gap-2">
            <Video className="h-5 w-5 text-viverblue" />
            Vídeos Educacionais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-400 mb-6">
            Assista aos vídeos educacionais para aprender como implementar esta solução passo a passo.
          </p>
          
          <div className="space-y-8">
            {videos.map((video) => (
              <VideoItem key={video.id} video={video} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

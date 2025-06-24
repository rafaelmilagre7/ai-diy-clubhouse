
import React from "react";
import { Solution } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Play, Clock } from "lucide-react";

interface VideosTabProps {
  solution: Solution;
}

export const VideosTab = ({ solution }: VideosTabProps) => {
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
              Conteúdo em Vídeo
            </h3>
            <p className="text-neutral-400 max-w-md mx-auto">
              Os vídeos educacionais desta solução (via Panda Video) serão exibidos aqui, 
              organizados por ordem de aprendizado.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview de vídeos futuros */}
      <div className="grid gap-4">
        {['Introdução à Solução', 'Implementação Passo a Passo', 'Dicas Avançadas'].map((video, index) => (
          <Card key={index} className="bg-[#151823]/50 border border-white/5 opacity-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-12 bg-viverblue/20 rounded-lg flex items-center justify-center">
                  <Play className="h-6 w-6 text-viverblue" />
                </div>
                <div className="flex-1">
                  <h4 className="text-neutral-300 font-medium">
                    {video}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1">
                    <Clock className="h-3 w-3" />
                    <span>Vídeo em preparação</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};


import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { RefreshCw, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";

interface VideoMetadataUpdaterProps {
  lessonId?: string;
  courseId?: string;
}

export const VideoMetadataUpdater = ({ lessonId, courseId }: VideoMetadataUpdaterProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const updateVideosMetadata = async () => {
    try {
      setIsUpdating(true);
      toast.loading("Atualizando metadados dos vídeos...");
      
      // Parâmetros para a edge function
      const params = {
        lessonId,
        courseId,
      };
      
      // Chamar edge function para atualizar durações
      const { data, error } = await supabase.functions.invoke(
        'update-video-durations',
        { body: JSON.stringify(params) }
      );
      
      if (error) {
        console.error("Erro na edge function:", error);
        toast.error("Ocorreu um erro ao atualizar os metadados dos vídeos");
        return;
      }
      
      setResults(data);
      
      if (data && data.success > 0) {
        toast.success(`Metadados atualizados para ${data.success} vídeos`);
      } else {
        toast.info("Nenhum vídeo foi atualizado");
      }
    } catch (error) {
      console.error("Erro ao atualizar metadados:", error);
      toast.error("Ocorreu um erro ao atualizar metadados dos vídeos");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Atualizar Metadados dos Vídeos
        </CardTitle>
        <CardDescription>
          Busca as informações atualizadas de duração e thumbnail dos vídeos do Panda Video
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm mb-4">
          Utilize esta ferramenta para sincronizar os metadados dos vídeos (duração e thumbnails) 
          com os valores corretos do Panda Video.
        </p>
        
        {results && (
          <div className="mt-4 p-3 bg-muted rounded-md text-sm">
            <h4 className="font-medium mb-1">Resultados da atualização:</h4>
            <ul className="space-y-1">
              <li>Total processados: {results.totalProcessed}</li>
              <li>Atualizados com sucesso: {results.success}</li>
              <li>Falhas: {results.failed}</li>
            </ul>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={updateVideosMetadata} 
          disabled={isUpdating}
          className="w-full"
        >
          {isUpdating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Atualizando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar Metadados
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

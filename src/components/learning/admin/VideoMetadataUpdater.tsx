
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { RefreshCw, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface VideoMetadataUpdaterProps {
  lessonId?: string;
  courseId?: string;
  onComplete?: () => void;
}

export const VideoMetadataUpdater = ({ lessonId, courseId, onComplete }: VideoMetadataUpdaterProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [progress, setProgress] = useState<number>(0);

  const updateVideosMetadata = async () => {
    try {
      setIsUpdating(true);
      setProgress(10);
      toast.loading("Atualizando metadados dos vídeos...");
      
      // Limpar resultados anteriores
      setResults(null);
      
      // Parâmetros para a edge function
      const params = {
        lessonId,
        courseId,
      };
      
      setProgress(30);
      
      // Chamar edge function para atualizar durações
      const { data, error } = await supabase.functions.invoke(
        'update-video-durations',
        { body: JSON.stringify(params) }
      );
      
      setProgress(90);
      
      if (error) {
        console.error("Erro na edge function:", error);
        toast.error("Ocorreu um erro ao atualizar os metadados dos vídeos");
        return;
      }
      
      setResults(data);
      setProgress(100);
      
      if (data && data.success > 0) {
        toast.success(`Metadados atualizados para ${data.success} vídeos`);
        
        // Se houver um callback de conclusão, chamá-lo
        if (onComplete) {
          onComplete();
        }
      } else if (data && data.totalProcessed === 0) {
        toast.info("Nenhum vídeo encontrado para atualização");
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
        
        {isUpdating && (
          <div className="my-4 space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">{progress}% completo</p>
          </div>
        )}
        
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
          variant={results && results.failed > 0 ? "destructive" : "default"}
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

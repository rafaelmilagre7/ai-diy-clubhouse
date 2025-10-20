
import React, { useState } from "react";
import { VideoMetadataUpdater } from "@/components/learning/admin/VideoMetadataUpdater";
import { supabase } from "@/lib/supabase";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const AtualizarDuracoesPage: React.FC = () => {
  const { cursoId, aulaId } = useParams<{ cursoId?: string; aulaId?: string }>();
  const [isUpdating, setIsUpdating] = useState(false);

  // Buscar informações da aula se houver um aulaId
  const { data: aula } = useQuery({
    queryKey: ["aula-detalhes", aulaId],
    queryFn: async () => {
      if (!aulaId) return null;
      
      const { data, error } = await supabase
        .from("learning_lessons")
        .select("*, module:module_id(*)")
        .eq("id", aulaId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!aulaId
  });

  // Buscar informações do curso se houver um cursoId
  const { data: curso } = useQuery({
    queryKey: ["curso-detalhes", cursoId],
    queryFn: async () => {
      if (!cursoId) return null;
      
      const { data, error } = await supabase
        .from("learning_courses")
        .select("*")
        .eq("id", cursoId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!cursoId
  });

  const handleUpdateComplete = () => {
    toast.success("Metadados dos vídeos atualizados com sucesso!");
    setIsUpdating(false);
  };

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Atualizar Durações de Vídeos
          {aula && ` - ${aula.title}`}
          {!aula && curso && ` - ${curso.title}`}
        </h1>
        
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações</CardTitle>
            <CardDescription>
              Utilize esta ferramenta para atualizar as durações dos vídeos das aulas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              Este processo consulta a API do Panda Video para obter as durações corretas de todos os vídeos que ainda não possuem essa informação.
            </p>
            
            {aula && (
              <div className="mt-4">
                <h3 className="font-medium">Detalhes da Aula:</h3>
                <p>Título: {aula.title}</p>
                <p>Módulo: {aula.module?.title}</p>
              </div>
            )}
            
            {!aula && curso && (
              <div className="mt-4">
                <h3 className="font-medium">Detalhes do Curso:</h3>
                <p>Título: {curso.title}</p>
              </div>
            )}
            
            {!aula && !curso && (
              <div className="mt-4 p-4 bg-status-warning/10 dark:bg-status-warning/20 border border-status-warning/20 dark:border-status-warning/30 rounded-md">
                <p>Você está atualizando as durações de todos os vídeos da plataforma.</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <VideoMetadataUpdater 
          lessonId={aulaId} 
          courseId={cursoId}
          onComplete={handleUpdateComplete} 
        />
      </div>
    </div>
  );
};

export default AtualizarDuracoesPage;

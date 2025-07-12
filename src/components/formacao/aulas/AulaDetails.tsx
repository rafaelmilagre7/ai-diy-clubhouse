
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, ArrowLeft, FileText, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LearningLessonWithRelations } from "@/lib/supabase/types/extended";
import { PublishLessonButton } from "./PublishLessonButton";

interface AulaDetailsProps {
  aula: LearningLessonWithRelations;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export const AulaDetails = ({ aula, onEditClick, onDeleteClick }: AulaDetailsProps) => {
  const navigate = useNavigate();
  const [isPublished, setIsPublished] = useState(aula.published || false);
  const [activeTab, setActiveTab] = useState("details");
  
  const handlePublishChange = (published: boolean) => {
    setIsPublished(published);
  };
  
  const formattedDate = aula.created_at 
    ? format(new Date(aula.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : "Data desconhecida";
    
  // Calcula o total de vídeos - verificando se existe a propriedade
  const totalVideos = aula.videos?.length || 0;
  // Calcula o total de recursos - verificando se existe a propriedade
  const totalRecursos = aula.resources?.length || 0;
  
  // Função para gerar o caminho para a visualização de membro
  const getPreviewPath = () => {
    // Estrutura esperada: /formacao/aulas/view/:cursoId/:aulaId
    // Primeiro precisamos encontrar o curso através do módulo
    if (aula.module?.course_id) {
      return `/formacao/aulas/view/${aula.module.course_id}/${aula.id}`;
    }
    // Fallback se não tiver o course_id
    return `/formacao/aulas/view/preview/${aula.id}`;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onEditClick}>
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Button>
          
          <Button variant="outline" size="sm" onClick={onDeleteClick} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-1" />
            Excluir
          </Button>
          
          <PublishLessonButton 
            lessonId={aula.id}
            isPublished={isPublished}
            onPublishChange={handlePublishChange}
          />
        </div>
      </div>
      
      {aula.cover_image_url && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <img 
            src={aula.cover_image_url} 
            alt={aula.title} 
            className="h-full w-full object-cover" 
          />
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{aula.title}</CardTitle>
          <CardDescription>
            Criado em {formattedDate} • 
            {isPublished ? " Publicado" : " Não publicado"} •
            {aula.estimated_time_minutes ? ` ${aula.estimated_time_minutes} minutos` : " Duração não definida"}
          </CardDescription>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardContent>
            <TabsList className="mb-4">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="videos">Vídeos ({totalVideos})</TabsTrigger>
              <TabsTrigger value="resources">Recursos ({totalRecursos})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Descrição</h3>
                {aula.description ? (
                  <p className="text-muted-foreground">{aula.description}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Nenhuma descrição disponível.</p>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Conteúdo</h3>
                {aula.content ? (
                  <div className="prose max-w-none">
                    <pre className="text-sm overflow-auto p-2 bg-muted rounded-md">
                      {JSON.stringify(aula.content, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Nenhum conteúdo disponível.</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="videos" className="space-y-4">
              {aula.videos && aula.videos.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {aula.videos.map((video, index) => (
                    <Card key={video.id || index}>
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">{video.title || `Vídeo ${index + 1}`}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        {video.thumbnail_url ? (
                          <div className="aspect-video w-full overflow-hidden rounded-md">
                            <img 
                              src={video.thumbnail_url} 
                              alt={video.title || `Thumbnail do vídeo ${index + 1}`}
                              className="h-full w-full object-cover" 
                            />
                          </div>
                        ) : (
                          <div className="aspect-video w-full bg-muted flex items-center justify-center rounded-md">
                            <FileText className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Nenhum vídeo disponível.</p>
              )}
            </TabsContent>
            
            <TabsContent value="resources" className="space-y-4">
              {aula.resources && aula.resources.length > 0 ? (
                <ul className="space-y-2">
                  {aula.resources.map((resource, index) => (
                    <li key={resource.id || index} className="flex items-center justify-between p-2 border rounded-md">
                      <span>{resource.name}</span>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">Nenhum recurso disponível.</p>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/formacao/modulos/${aula.module_id}`}>
              Ver módulo
            </Link>
          </Button>
          
          {isPublished && (
            <Button variant="outline" size="sm" asChild>
              <Link to={getPreviewPath()}>
                Visualizar como membro
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};


import React from "react";
import { UseFormReturn } from "react-hook-form";
import { AulaFormValues, AulaVideo } from "../AulaStepWizard";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { YoutubeEmbed } from "@/components/common/YoutubeEmbed";

interface EtapaRevisaoProps {
  form: UseFormReturn<AulaFormValues>;
  onPrevious: () => void;
  onSubmit: () => void;
  isSaving: boolean;
}

const EtapaRevisao: React.FC<EtapaRevisaoProps> = ({
  form,
  onPrevious,
  onSubmit,
  isSaving,
}) => {
  const formValues = form.getValues();
  
  // Função para extrair ID do vídeo do YouTube
  const getYoutubeVideoId = (url: string): string | null => {
    if (!url) return null;
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    } catch (error) {
      console.error("Erro ao extrair ID do YouTube:", error);
      return null;
    }
  };

  // Renderizar preview do vídeo
  const renderVideoPreview = (video: AulaVideo) => {
    if (video.origin === "youtube") {
      const videoId = getYoutubeVideoId(video.url || "");
      if (!videoId) return null;
      
      return <YoutubeEmbed youtubeId={videoId} title={video.title} className="mb-4" />;
    } else {
      return (
        <div className="aspect-video mb-4 bg-gray-100 rounded-md flex items-center justify-center">
          <p className="text-muted-foreground">Prévia do vídeo do Panda Video</p>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6 py-4">
      <h3 className="text-lg font-medium">Revisão da Aula</h3>
      
      <Card className="mb-4">
        <CardHeader>
          <h4 className="text-base font-medium">Informações Básicas</h4>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Título</dt>
              <dd className="mt-1">{formValues.title}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Nível de Dificuldade</dt>
              <dd className="mt-1">{formValues.difficultyLevel || "Não definido"}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-sm font-medium text-muted-foreground">Descrição</dt>
              <dd className="mt-1">{formValues.description}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <h4 className="text-base font-medium">Conteúdo</h4>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none prose-sm">
            <p>{formValues.content}</p>
          </div>
        </CardContent>
      </Card>

      {formValues.videos && formValues.videos.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <h4 className="text-base font-medium">Vídeos ({formValues.videos.length})</h4>
          </CardHeader>
          <CardContent>
            {formValues.videos.map((video, index) => (
              <div key={index} className="mb-4 pb-4 border-b last:border-b-0 last:pb-0 last:mb-0">
                <h5 className="font-medium">{video.title || `Vídeo ${index + 1}`}</h5>
                <p className="text-sm text-muted-foreground mb-2">{video.description}</p>
                {renderVideoPreview(video)}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Voltar
        </Button>
        <Button 
          type="button" 
          onClick={onSubmit} 
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Salvando...
            </>
          ) : (
            "Publicar Aula"
          )}
        </Button>
      </div>
    </div>
  );
};

export default EtapaRevisao;

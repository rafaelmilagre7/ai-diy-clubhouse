
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Upload, Video, FileText, Image, Plus, X, Save, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface AulaWizardProps {
  moduleId: string;
  lessonId?: string;
  onComplete: () => void;
  onCancel: () => void;
}

interface VideoData {
  id: string;
  title: string;
  description: string;
  url: string;
  video_type: string;
  video_file_name?: string;
  video_file_path?: string;
  file_size_bytes?: number;
  duration_seconds?: number;
  thumbnail_url?: string;
  video_id?: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  cover_image_url: string;
  course_id: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  order_index: number;
}

export const AulaWizard = ({ moduleId, lessonId, onComplete, onCancel }: AulaWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    content: '',
    estimated_time_minutes: 0,
    difficulty_level: 'beginner',
    published: false,
    ai_assistant_enabled: true,
    ai_assistant_prompt: '',
    cover_image_url: ''
  });
  
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Buscar vídeos existentes se editando
  useEffect(() => {
    if (lessonId) {
      fetchExistingVideos();
    }
  }, [lessonId]);

  // Buscar módulos
  useEffect(() => {
    fetchModules();
  }, []);

  const fetchExistingVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_lesson_videos')
        .select('*')
        .eq('lesson_id', lessonId as any)
        .order('order_index');

      if (error) throw error;

      if (data) {
        const mappedVideos: VideoData[] = (data as any[]).map(video => ({
          id: (video as any).id,
          title: (video as any).title,
          description: (video as any).description,
          url: (video as any).url,
          video_type: (video as any).video_type,
          video_file_name: (video as any).video_file_name,
          video_file_path: (video as any).video_file_path,
          file_size_bytes: (video as any).file_size_bytes,
          duration_seconds: (video as any).duration_seconds,
          thumbnail_url: (video as any).thumbnail_url,
          video_id: (video as any).video_id
        }));
        setVideos(mappedVideos);
      }
    } catch (error) {
      console.error('Erro ao buscar vídeos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os vídeos existentes.",
        variant: "destructive",
      });
    }
  };

  const fetchModules = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('learning_modules')
        .select('*')
        .order('order_index');

      if (error) throw error;

      if (data) {
        setModules((data as any) || []);
      }
    } catch (error) {
      console.error('Erro ao buscar módulos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os módulos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLessonSubmit = async () => {
    try {
      setIsLoading(true);
      
      const lessonPayload = {
        module_id: moduleId,
        title: lessonData.title,
        description: lessonData.description,
        content: JSON.stringify({ blocks: [] }), // Estrutura básica
        estimated_time_minutes: lessonData.estimated_time_minutes,
        difficulty_level: lessonData.difficulty_level,
        published: lessonData.published,
        ai_assistant_enabled: lessonData.ai_assistant_enabled,
        ai_assistant_prompt: lessonData.ai_assistant_prompt,
        cover_image_url: lessonData.cover_image_url,
        order_index: 0
      };

      let result;
      if (lessonId) {
        // Atualizar aula existente
        result = await supabase
          .from('learning_lessons')
          .update(lessonPayload as any)
          .eq('id', lessonId as any)
          .select()
          .single();
      } else {
        // Criar nova aula
        result = await supabase
          .from('learning_lessons')
          .insert(lessonPayload as any)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: "Sucesso",
        description: lessonId ? "Aula atualizada com sucesso!" : "Aula criada com sucesso!",
      });

      onComplete();
    } catch (error: any) {
      console.error('Erro ao salvar aula:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar a aula.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addVideo = () => {
    const newVideo: VideoData = {
      id: `temp-${Date.now()}`,
      title: '',
      description: '',
      url: '',
      video_type: 'youtube'
    };
    setVideos([...videos, newVideo]);
  };

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const updateVideo = (index: number, field: keyof VideoData, value: string) => {
    const updatedVideos = [...videos];
    (updatedVideos[index] as any)[field] = value;
    setVideos(updatedVideos);
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Informações Básicas da Aula
        </CardTitle>
        <CardDescription>
          Configure as informações principais da sua aula
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Título da Aula</Label>
          <Input
            id="title"
            placeholder="Digite o título da aula"
            value={lessonData.title}
            onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            placeholder="Descreva o que será ensinado nesta aula"
            value={lessonData.description}
            onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="time">Tempo Estimado (minutos)</Label>
            <Input
              id="time"
              type="number"
              placeholder="60"
              value={lessonData.estimated_time_minutes}
              onChange={(e) => setLessonData({ ...lessonData, estimated_time_minutes: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Nível de Dificuldade</Label>
            <Select 
              value={lessonData.difficulty_level} 
              onValueChange={(value) => setLessonData({ ...lessonData, difficulty_level: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Iniciante</SelectItem>
                <SelectItem value="intermediate">Intermediário</SelectItem>
                <SelectItem value="advanced">Avançado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cover">URL da Imagem de Capa</Label>
          <Input
            id="cover"
            placeholder="https://exemplo.com/imagem.jpg"
            value={lessonData.cover_image_url}
            onChange={(e) => setLessonData({ ...lessonData, cover_image_url: e.target.value })}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="published"
            checked={lessonData.published}
            onCheckedChange={(checked) => setLessonData({ ...lessonData, published: checked })}
          />
          <Label htmlFor="published">Publicar aula imediatamente</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="ai-assistant"
            checked={lessonData.ai_assistant_enabled}
            onCheckedChange={(checked) => setLessonData({ ...lessonData, ai_assistant_enabled: checked })}
          />
          <Label htmlFor="ai-assistant">Habilitar assistente de IA</Label>
        </div>

        {lessonData.ai_assistant_enabled && (
          <div className="space-y-2">
            <Label htmlFor="ai-prompt">Prompt do Assistente de IA</Label>
            <Textarea
              id="ai-prompt"
              placeholder="Instruções para o assistente de IA sobre como ajudar nesta aula"
              value={lessonData.ai_assistant_prompt}
              onChange={(e) => setLessonData({ ...lessonData, ai_assistant_prompt: e.target.value })}
              rows={3}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Vídeos da Aula
        </CardTitle>
        <CardDescription>
          Adicione os vídeos que farão parte desta aula
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {videos.map((video, index) => (
          <Card key={video.id} className="p-4">
            <div className="flex items-start justify-between mb-4">
              <Badge variant="outline">Vídeo {index + 1}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeVideo(index)}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Título do Vídeo</Label>
                <Input
                  placeholder="Digite o título do vídeo"
                  value={video.title}
                  onChange={(e) => updateVideo(index, 'title', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  placeholder="Descrição do vídeo"
                  value={video.description}
                  onChange={(e) => updateVideo(index, 'description', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Vídeo</Label>
                  <Select 
                    value={video.video_type} 
                    onValueChange={(value) => updateVideo(index, 'video_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="vimeo">Vimeo</SelectItem>
                      <SelectItem value="upload">Upload Direto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>URL do Vídeo</Label>
                  <Input
                    placeholder="https://youtube.com/watch?v=..."
                    value={video.url}
                    onChange={(e) => updateVideo(index, 'url', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}

        <Button onClick={addVideo} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Vídeo
        </Button>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="h-5 w-5" />
          Revisão e Finalização
        </CardTitle>
        <CardDescription>
          Revise as informações antes de salvar a aula
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <h3 className="font-semibold">{lessonData.title}</h3>
          <p className="text-sm text-muted-foreground">{lessonData.description}</p>
          <div className="flex gap-2 text-xs">
            <Badge variant="outline">{lessonData.difficulty_level}</Badge>
            <Badge variant="outline">{lessonData.estimated_time_minutes} min</Badge>
            {lessonData.published && <Badge>Publicada</Badge>}
          </div>
        </div>

        {videos.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Vídeos ({videos.length})</h4>
            <div className="space-y-2">
              {videos.map((video, index) => (
                <div key={video.id} className="bg-muted p-3 rounded text-sm">
                  <div className="font-medium">{video.title || `Vídeo ${index + 1}`}</div>
                  <div className="text-muted-foreground">{video.video_type}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button 
          onClick={handleLessonSubmit} 
          className="w-full" 
          disabled={isLoading || !lessonData.title}
        >
          {isLoading ? 'Salvando...' : (lessonId ? 'Atualizar Aula' : 'Criar Aula')}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {lessonId ? 'Editar Aula' : 'Nova Aula'}
          </h1>
          <p className="text-muted-foreground">
            Passo {currentStep} de 3
          </p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center space-x-2">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step}
            </div>
            {step < 3 && (
              <div
                className={`w-16 h-1 ${
                  step < currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      {/* Navigation */}
      {currentStep < 3 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!lessonData.title}
          >
            Próximo
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};

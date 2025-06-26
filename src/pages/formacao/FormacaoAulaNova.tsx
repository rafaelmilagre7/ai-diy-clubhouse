import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { ensureStorageBucketExists } from "@/lib/supabase/storage"; // Importação corrigida
import { useQuery } from "@tanstack/react-query";
import { Loader2, Upload, X } from "lucide-react";

interface LearningCourse {
  id: string;
  title: string;
}

interface LearningModule {
  id: string;
  title: string;
  course_id: string;
}

interface VideoFile {
  file: File;
  preview: string;
  uploading: boolean;
}

export default function FormacaoAulaNova() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoFiles, setVideoFiles] = useState<VideoFile[]>([]);
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    estimated_time_minutes: 30,
    difficulty_level: 'beginner' as const,
    cover_image_url: '',
    ai_assistant_enabled: true,
    ai_assistant_prompt: '',
    published: false
  });

  // Queries para cursos e módulos
  
  const { data: courses } = useQuery({
    queryKey: ['learning-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_courses')
        .select('id, title')
        .eq('published', true)
        .order('title');
      
      if (error) throw error;
      return data as LearningCourse[];
    }
  });

  const { data: modules } = useQuery({
    queryKey: ['learning-modules', courseId],
    queryFn: async () => {
      if (!courseId) return [];
      
      const { data, error } = await supabase
        .from('learning_modules')
        .select('id, title, course_id')
        .eq('course_id', courseId)
        .order('order_index');
      
      if (error) throw error;
      return data as LearningModule[];
    },
    enabled: !!courseId
  });

  // Função para adicionar arquivo de vídeo
  const handleVideoFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione apenas arquivos de vídeo.",
          variant: "destructive"
        });
        return;
      }

      const preview = URL.createObjectURL(file);
      setVideoFiles(prev => [...prev, { file, preview, uploading: false }]);
    });
  };

  // Função para remover arquivo de vídeo
  const removeVideoFile = (index: number) => {
    setVideoFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  // Função para fazer upload de vídeos
  const uploadVideos = async (lessonId: string) => {
    const uploadPromises = videoFiles.map(async (videoFile, index) => {
      setVideoFiles(prev => 
        prev.map((vf, i) => i === index ? { ...vf, uploading: true } : vf)
      );

      try {
        // Garantir que o bucket existe
        await ensureStorageBucketExists('learning_videos');
        
        const fileName = `${lessonId}/${Date.now()}_${videoFile.file.name}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('learning_videos')
          .upload(fileName, videoFile.file);

        if (uploadError) throw uploadError;

        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('learning_videos')
          .getPublicUrl(fileName);

        // Salvar informações do vídeo na tabela
        const { error: videoError } = await supabase
          .from('learning_lesson_videos')
          .insert({
            lesson_id: lessonId,
            title: videoFile.file.name.replace(/\.[^/.]+$/, ""),
            url: publicUrl,
            video_type: 'upload',
            video_file_path: fileName,
            video_file_name: videoFile.file.name,
            file_size_bytes: videoFile.file.size,
            order_index: index
          });

        if (videoError) throw videoError;

        return { success: true, fileName };
      } catch (error) {
        console.error('Erro no upload do vídeo:', error);
        return { success: false, error };
      }
    });

    const results = await Promise.all(uploadPromises);
    return results;
  };

  // Função para enviar o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!moduleId) {
      toast({
        title: "Erro",
        description: "Módulo não selecionado.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Criar a aula
      const { data: lessonData, error: lessonError } = await supabase
        .from('learning_lessons')
        .insert({
          module_id: moduleId,
          title: formData.title,
          description: formData.description,
          estimated_time_minutes: formData.estimated_time_minutes,
          difficulty_level: formData.difficulty_level,
          cover_image_url: formData.cover_image_url || null,
          ai_assistant_enabled: formData.ai_assistant_enabled,
          ai_assistant_prompt: formData.ai_assistant_prompt || null,
          published: formData.published,
          content: formData.content ? JSON.parse(formData.content) : null
        })
        .select()
        .single();

      if (lessonError) throw lessonError;

      // Upload dos vídeos se houver
      if (videoFiles.length > 0) {
        const uploadResults = await uploadVideos(lessonData.id);
        const failedUploads = uploadResults.filter(r => !r.success);
        
        if (failedUploads.length > 0) {
          toast({
            title: "Aula criada com avisos",
            description: `Aula criada, mas ${failedUploads.length} vídeo(s) falharam no upload.`,
            variant: "destructive"
          });
        }
      }

      toast({
        title: "Sucesso!",
        description: "Aula criada com sucesso.",
      });

      navigate(`/formacao/cursos/${courseId}/modulos/${moduleId}`);
    } catch (error) {
      console.error('Erro ao criar aula:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar aula. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova Aula</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campos básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título da Aula *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="estimated_time">Tempo Estimado (minutos)</Label>
                <Input
                  id="estimated_time"
                  type="number"
                  min="1"
                  value={formData.estimated_time_minutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_time_minutes: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="difficulty">Nível de Dificuldade</Label>
              <Select 
                value={formData.difficulty_level} 
                onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                  setFormData(prev => ({ ...prev, difficulty_level: value }))
                }
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

            {/* Upload de vídeos */}
            <div>
              <Label>Vídeos da Aula</Label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoFileSelect}
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Adicionar Vídeos
                </label>
              </div>

              {videoFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {videoFiles.map((videoFile, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <video
                          src={videoFile.preview}
                          className="w-16 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="text-sm font-medium">{videoFile.file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(videoFile.file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVideoFile(index)}
                        disabled={videoFile.uploading}
                      >
                        {videoFile.uploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botões de ação */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Aula'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

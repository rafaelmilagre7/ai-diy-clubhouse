-- Criar tabela para armazenar durações calculadas dos cursos
CREATE TABLE public.course_durations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.learning_courses(id) ON DELETE CASCADE,
  total_duration_seconds INTEGER NOT NULL DEFAULT 0,
  total_videos INTEGER NOT NULL DEFAULT 0,
  synced_videos INTEGER NOT NULL DEFAULT 0,
  calculated_hours TEXT NOT NULL DEFAULT '0 horas',
  last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sync_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id)
);

-- Enable RLS
ALTER TABLE public.course_durations ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Administradores podem gerenciar durações de cursos"
  ON public.course_durations
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  ));

CREATE POLICY "Usuários podem visualizar durações de cursos"
  ON public.course_durations
  FOR SELECT
  USING (true);

-- Trigger para atualizar timestamp
CREATE OR REPLACE FUNCTION public.update_course_durations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_course_durations_updated_at
  BEFORE UPDATE ON public.course_durations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_course_durations_updated_at();

-- Índices para performance
CREATE INDEX idx_course_durations_course_id ON public.course_durations(course_id);
CREATE INDEX idx_course_durations_sync_status ON public.course_durations(sync_status);

-- Inserir registros iniciais para cursos existentes
INSERT INTO public.course_durations (course_id, sync_status)
SELECT id, 'pending' 
FROM public.learning_courses 
WHERE published = true
ON CONFLICT (course_id) DO NOTHING;
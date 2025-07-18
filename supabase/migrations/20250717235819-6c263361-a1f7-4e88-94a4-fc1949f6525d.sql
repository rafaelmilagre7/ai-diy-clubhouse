-- FASE 1: Correção Crítica - Criar tabela implementation_checkpoints para checklists
CREATE TABLE public.implementation_checkpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  solution_id UUID NOT NULL,
  checkpoint_data JSONB NOT NULL DEFAULT '{}',
  completed_steps TEXT[] DEFAULT ARRAY[]::TEXT[],
  total_steps INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,
  last_completed_step TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.implementation_checkpoints ENABLE ROW LEVEL SECURITY;

-- Create policies for checkpoints
CREATE POLICY "Users can view their own checkpoints" 
ON public.implementation_checkpoints 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own checkpoints" 
ON public.implementation_checkpoints 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checkpoints" 
ON public.implementation_checkpoints 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checkpoints" 
ON public.implementation_checkpoints 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all checkpoints" 
ON public.implementation_checkpoints 
FOR ALL 
USING (is_user_admin(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_implementation_checkpoints_updated_at
BEFORE UPDATE ON public.implementation_checkpoints
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_implementation_checkpoints_user_solution 
ON public.implementation_checkpoints(user_id, solution_id);

CREATE INDEX idx_implementation_checkpoints_progress 
ON public.implementation_checkpoints(progress_percentage);

-- FASE 2: Limpar e padronizar storage buckets
-- Garantir que todos os buckets essenciais existam com nomes padronizados
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('profile_images', 'profile_images', true),
  ('solution_files', 'solution_files', true),
  ('learning_materials', 'learning_materials', true), 
  ('learning_videos', 'learning_videos', true),
  ('learning_covers', 'learning_covers', true),
  ('tool_logos', 'tool_logos', true)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  public = EXCLUDED.public;

-- Limpar policies antigas inconsistentes e criar policies unificadas
DROP POLICY IF EXISTS "Anyone can view files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete files" ON storage.objects;

-- Policies unificadas para storage
CREATE POLICY "Public bucket files are viewable by everyone" 
ON storage.objects 
FOR SELECT 
USING (bucket_id IN ('profile_images', 'solution_files', 'learning_materials', 'learning_videos', 'learning_covers', 'tool_logos'));

CREATE POLICY "Authenticated users can upload to allowed buckets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  bucket_id IN ('profile_images', 'solution_files', 'learning_materials', 'learning_videos', 'learning_covers', 'tool_logos')
);

CREATE POLICY "Users can update their own files or admins can update any" 
ON storage.objects 
FOR UPDATE 
USING (
  (auth.uid() IS NOT NULL AND bucket_id IN ('profile_images', 'solution_files', 'learning_materials', 'learning_videos', 'learning_covers', 'tool_logos'))
  OR is_user_admin(auth.uid())
);

CREATE POLICY "Users can delete their own files or admins can delete any" 
ON storage.objects 
FOR DELETE 
USING (
  (auth.uid() IS NOT NULL AND bucket_id IN ('profile_images', 'solution_files', 'learning_materials', 'learning_videos', 'learning_covers', 'tool_logos'))
  OR is_user_admin(auth.uid())
);
-- Criar bucket para fotos de perfil se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-pictures', 
  'profile-pictures', 
  true, 
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Criar políticas para o bucket profile-pictures
DO $$
BEGIN
  -- Política para SELECT (visualização) - todos podem ver fotos públicas
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can view profile pictures'
  ) THEN
    CREATE POLICY "Anyone can view profile pictures"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'profile-pictures');
  END IF;

  -- Política para INSERT (upload) - apenas usuários autenticados podem fazer upload de suas próprias fotos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload their own profile pictures'
  ) THEN
    CREATE POLICY "Users can upload their own profile pictures"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'profile-pictures' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  -- Política para UPDATE - usuários podem atualizar suas próprias fotos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update their own profile pictures'
  ) THEN
    CREATE POLICY "Users can update their own profile pictures"
    ON storage.objects
    FOR UPDATE
    USING (
      bucket_id = 'profile-pictures' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  -- Política para DELETE - usuários podem deletar suas próprias fotos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete their own profile pictures'
  ) THEN
    CREATE POLICY "Users can delete their own profile pictures"
    ON storage.objects
    FOR DELETE
    USING (
      bucket_id = 'profile-pictures' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

-- Criar bucket lesson_images para imagens de aulas
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('lesson_images', 'lesson_images', true, 10485760) -- 10MB limit
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 10485760;

-- Política para permitir leitura pública das imagens de aulas
CREATE POLICY "Acesso público para leitura de imagens de aulas"
ON storage.objects FOR SELECT
USING (bucket_id = 'lesson_images');

-- Política para permitir upload de imagens para usuários autenticados
CREATE POLICY "Upload de imagens de aulas para usuários autenticados"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'lesson_images' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir atualização de imagens pelos proprietários
CREATE POLICY "Atualização de imagens de aulas pelo proprietário"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'lesson_images' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'lesson_images' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir exclusão de imagens pelos proprietários  
CREATE POLICY "Exclusão de imagens de aulas pelo proprietário"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'lesson_images' 
  AND auth.role() = 'authenticated'
);

-- Comentário para documentar o bucket
COMMENT ON TABLE storage.buckets IS 'Bucket lesson_images criado para armazenar imagens de capa das aulas';

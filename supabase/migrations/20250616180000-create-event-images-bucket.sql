
-- Migração para criar bucket de imagens de eventos
-- Cria bucket event_images para armazenar imagens de capa dos eventos

-- Criar bucket para imagens de eventos
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('event_images', 'event_images', true, 10485760) -- 10MB limit
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 10485760;

-- Política para permitir leitura pública das imagens
CREATE POLICY "Acesso público para leitura de imagens de eventos"
ON storage.objects FOR SELECT
USING (bucket_id = 'event_images');

-- Política para permitir upload de imagens para usuários autenticados
CREATE POLICY "Upload de imagens de eventos para usuários autenticados"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event_images' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir atualização de imagens pelos proprietários
CREATE POLICY "Atualização de imagens de eventos pelo proprietário"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'event_images' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'event_images' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir exclusão de imagens pelos proprietários
CREATE POLICY "Exclusão de imagens de eventos pelo proprietário"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event_images' 
  AND auth.role() = 'authenticated'
);

-- Comentário para documentar o bucket
COMMENT ON TABLE storage.buckets IS 'Bucket event_images criado para armazenar imagens de capa dos eventos';

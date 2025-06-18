
-- Criar bucket lesson_materials para materiais de aulas
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('lesson_materials', 'lesson_materials', true, 104857600) -- 100MB limit
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 104857600;

-- Criar bucket learning_materials para recursos de aprendizado
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('learning_materials', 'learning_materials', true, 104857600) -- 100MB limit
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 104857600;

-- Política para permitir leitura pública dos materiais de aulas
CREATE POLICY "Acesso público para leitura de materiais de aulas"
ON storage.objects FOR SELECT
USING (bucket_id = 'lesson_materials');

-- Política para permitir upload de materiais para usuários autenticados
CREATE POLICY "Upload de materiais de aulas para usuários autenticados"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'lesson_materials' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir atualização de materiais pelos proprietários
CREATE POLICY "Atualização de materiais de aulas pelo proprietário"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'lesson_materials' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'lesson_materials' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir exclusão de materiais pelos proprietários  
CREATE POLICY "Exclusão de materiais de aulas pelo proprietário"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'lesson_materials' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir leitura pública dos recursos de aprendizado
CREATE POLICY "Acesso público para leitura de recursos de aprendizado"
ON storage.objects FOR SELECT
USING (bucket_id = 'learning_materials');

-- Política para permitir upload de recursos para usuários autenticados
CREATE POLICY "Upload de recursos de aprendizado para usuários autenticados"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'learning_materials' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir atualização de recursos pelos proprietários
CREATE POLICY "Atualização de recursos de aprendizado pelo proprietário"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'learning_materials' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'learning_materials' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir exclusão de recursos pelos proprietários  
CREATE POLICY "Exclusão de recursos de aprendizado pelo proprietário"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'learning_materials' 
  AND auth.role() = 'authenticated'
);

-- Comentários para documentar os buckets
COMMENT ON TABLE storage.buckets IS 'Buckets lesson_materials e learning_materials criados para armazenar materiais de aulas e recursos de aprendizado';

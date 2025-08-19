-- Criar bucket para certificados
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certificates',
  'certificates',
  true,
  10485760, -- 10MB
  ARRAY['application/pdf']
);

-- Política para permitir que qualquer usuário autenticado faça upload de PDFs
CREATE POLICY "Users can upload their own certificate PDFs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'certificates' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = 'public'
);

-- Política para permitir leitura pública dos PDFs
CREATE POLICY "Public certificate PDFs are publicly accessible"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'certificates' 
  AND (storage.foldername(name))[1] = 'public'
);
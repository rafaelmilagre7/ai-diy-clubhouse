-- Criar bucket de storage para certificados e previews
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
  ('certificates', 'certificates', true, 52428800, ARRAY['application/pdf', 'image/png', 'image/jpeg'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf', 'image/png', 'image/jpeg'];

-- Políticas para o bucket certificates
CREATE POLICY "Anyone can view certificate files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'certificates');

CREATE POLICY "Authenticated users can upload certificate files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'certificates' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their certificate files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'certificates' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their certificate files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'certificates' AND auth.uid() IS NOT NULL);
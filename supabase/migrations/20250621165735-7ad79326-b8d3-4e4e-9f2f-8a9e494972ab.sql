
-- Criar bucket para armazenar as logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'brand-logos',
  'brand-logos',
  true,
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
);

-- Criar políticas para o bucket brand-logos
CREATE POLICY "Acesso público de leitura para logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'brand-logos');

CREATE POLICY "Upload autenticado para logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'brand-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Update autenticado para logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'brand-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Delete autenticado para logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'brand-logos' AND auth.role() = 'authenticated');

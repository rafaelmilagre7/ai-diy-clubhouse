-- Criar bucket para logos e assets se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'logos',
  'logos', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir visualização pública das logos
CREATE POLICY "Public logos are accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'logos');

-- Política para permitir upload de logos (apenas admins)
CREATE POLICY "Admins can upload logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'logos' 
  AND public.is_user_admin_secure(auth.uid())
);
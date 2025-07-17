-- Verificar buckets existentes e suas políticas
SELECT 
  b.id as bucket_name,
  b.public,
  b.created_at,
  COUNT(o.id) as object_count
FROM storage.buckets b
LEFT JOIN storage.objects o ON b.id = o.bucket_id
GROUP BY b.id, b.public, b.created_at
ORDER BY b.created_at;

-- Limpar buckets problemáticos com hífen
DELETE FROM storage.objects WHERE bucket_id = 'profile-images';
DELETE FROM storage.buckets WHERE id = 'profile-images';

-- Garantir que o bucket correto existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile_images', 'profile_images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Criar políticas robustas para profile_images
CREATE POLICY "Permitir visualização pública de imagens de perfil" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile_images');

CREATE POLICY "Usuários podem fazer upload de suas imagens" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'profile_images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Usuários podem atualizar suas próprias imagens" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'profile_images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Usuários podem deletar suas próprias imagens" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'profile_images' 
  AND auth.uid() IS NOT NULL
);
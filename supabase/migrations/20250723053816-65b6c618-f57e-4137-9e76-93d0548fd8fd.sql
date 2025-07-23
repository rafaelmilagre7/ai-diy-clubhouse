-- Criar bucket para fotos de perfil
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-pictures', 'Profile Pictures', true);

-- Criar políticas para fotos de perfil
CREATE POLICY "Users can view all profile pictures" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can upload their own profile picture" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile picture" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile picture" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Atualizar personal_info no onboarding para incluir novos campos
UPDATE public.onboarding_final 
SET personal_info = personal_info || jsonb_build_object(
  'instagram_url', '',
  'linkedin_url', '',
  'profile_picture', '',
  'fun_fact', ''
)
WHERE personal_info IS NOT NULL;
-- Criar bucket para armazenar certificados
INSERT INTO storage.buckets (id, name, public) 
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para bucket de certificados
CREATE POLICY "Certificados são visíveis publicamente"
ON storage.objects FOR SELECT
USING (bucket_id = 'certificates');

CREATE POLICY "Usuários podem fazer upload de seus certificados"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'certificates' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuários podem atualizar seus certificados"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'certificates' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins podem gerenciar todos os certificados"
ON storage.objects FOR ALL
USING (
  bucket_id = 'certificates' AND
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);
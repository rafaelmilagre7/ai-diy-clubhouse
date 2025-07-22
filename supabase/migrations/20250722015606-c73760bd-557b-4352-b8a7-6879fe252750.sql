-- Adicionar campo para armazenar PDF dos certificados
ALTER TABLE solution_certificates 
ADD COLUMN IF NOT EXISTS certificate_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS certificate_pdf_path TEXT;

-- Criar tabela para armazenar PDFs de certificados se não existir
CREATE TABLE IF NOT EXISTS certificate_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id UUID NOT NULL REFERENCES solution_certificates(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_url TEXT,
  file_size BIGINT,
  mime_type TEXT DEFAULT 'application/pdf',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para certificate_files
ALTER TABLE certificate_files ENABLE ROW LEVEL SECURITY;

-- Política para visualizar certificados próprios
CREATE POLICY "Users can view their own certificate files"
ON certificate_files FOR SELECT
USING (
  certificate_id IN (
    SELECT id FROM solution_certificates 
    WHERE user_id = auth.uid()
  )
);

-- Política para admins visualizarem todos os certificados
CREATE POLICY "Admins can view all certificate files"
ON certificate_files FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_certificate_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER certificate_files_updated_at
  BEFORE UPDATE ON certificate_files
  FOR EACH ROW
  EXECUTE FUNCTION update_certificate_files_updated_at();
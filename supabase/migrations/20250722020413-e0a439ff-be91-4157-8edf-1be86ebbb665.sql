-- Adicionar colunas que faltam na tabela progress
ALTER TABLE public.progress 
ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0;

-- Adicionar colunas que faltam na tabela solution_certificates para URLs do PDF
ALTER TABLE public.solution_certificates 
ADD COLUMN IF NOT EXISTS certificate_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS certificate_pdf_path TEXT;
-- ============================================================================
-- CORREÇÕES CRÍTICAS - SISTEMA DE CERTIFICADOS (PARTE 1)
-- ============================================================================

-- 1. CRIAR TABELA LEARNING_CERTIFICATE_TEMPLATES (CRÍTICO - ESTAVA FALTANDO)
CREATE TABLE IF NOT EXISTS public.learning_certificate_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  html_template TEXT NOT NULL,
  css_styles TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  course_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. PADRONIZAR TABELAS DE CERTIFICADOS - REMOVER CAMPOS REDUNDANTES
ALTER TABLE public.solution_certificates 
DROP COLUMN IF EXISTS certificate_pdf_url CASCADE,
DROP COLUMN IF EXISTS certificate_pdf_path CASCADE,
DROP COLUMN IF EXISTS certificate_filename CASCADE;

-- Adicionar campos padronizados se não existirem
ALTER TABLE public.solution_certificates 
ADD COLUMN IF NOT EXISTS completion_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.learning_certificates 
ADD COLUMN IF NOT EXISTS completion_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS template_id UUID,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 3. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_learning_certificates_user_id ON public.learning_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_certificates_course_id ON public.learning_certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_learning_certificates_validation_code ON public.learning_certificates(validation_code);
CREATE INDEX IF NOT EXISTS idx_solution_certificates_user_id ON public.solution_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_solution_certificates_solution_id ON public.solution_certificates(solution_id);
CREATE INDEX IF NOT EXISTS idx_solution_certificates_validation_code ON public.solution_certificates(validation_code);
CREATE INDEX IF NOT EXISTS idx_learning_certificate_templates_course_id ON public.learning_certificate_templates(course_id);
CREATE INDEX IF NOT EXISTS idx_learning_certificate_templates_active ON public.learning_certificate_templates(is_active);
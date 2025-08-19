-- ============================================================================
-- CORREÇÕES CRÍTICAS - SISTEMA DE CERTIFICADOS (PARTE 2) - RLS E POLICIES
-- ============================================================================

-- 1. HABILITAR RLS NA NOVA TABELA (CORRIGIR ERRO CRÍTICO)
ALTER TABLE public.learning_certificate_templates ENABLE ROW LEVEL SECURITY;

-- 2. CRIAR RLS POLICIES PARA LEARNING_CERTIFICATE_TEMPLATES
-- Admins podem fazer tudo
DROP POLICY IF EXISTS "Admins can manage learning certificate templates" ON public.learning_certificate_templates;
CREATE POLICY "Admins can manage learning certificate templates" 
ON public.learning_certificate_templates 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Usuários podem ver templates ativos
DROP POLICY IF EXISTS "Users can view active learning certificate templates" ON public.learning_certificate_templates;
CREATE POLICY "Users can view active learning certificate templates" 
ON public.learning_certificate_templates 
FOR SELECT 
USING (is_active = true);

-- 3. LIMPAR E RECRIAR POLICIES DUPLICADAS EM LEARNING_CERTIFICATES
DROP POLICY IF EXISTS "Admins podem gerenciar todos os certificados" ON public.learning_certificates;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios certificados" ON public.learning_certificates;
DROP POLICY IF EXISTS "learning_certificates_user_access" ON public.learning_certificates;

-- Policy unificada para learning_certificates
CREATE POLICY "learning_certificates_unified_access" 
ON public.learning_certificates 
FOR ALL 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 4. CRIAR TRIGGER PARA LEARNING_CERTIFICATE_TEMPLATES
CREATE OR REPLACE FUNCTION public.update_learning_certificate_templates_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_learning_certificate_templates_updated_at ON public.learning_certificate_templates;
CREATE TRIGGER update_learning_certificate_templates_updated_at
  BEFORE UPDATE ON public.learning_certificate_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_learning_certificate_templates_updated_at();

-- 5. CORRIGIR DADOS ÓRFÃOS - POPULAR completion_date onde está NULL
UPDATE public.solution_certificates 
SET completion_date = implementation_date 
WHERE completion_date IS NULL AND implementation_date IS NOT NULL;

UPDATE public.solution_certificates 
SET completion_date = issued_at 
WHERE completion_date IS NULL;

UPDATE public.learning_certificates 
SET completion_date = issued_at 
WHERE completion_date IS NULL;
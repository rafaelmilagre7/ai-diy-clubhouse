-- Corrigir políticas RLS da tabela progress para permitir funcionalidade completa do botão "Implementar solução"

-- 1. Criar política SELECT para progress - usuários podem ver apenas seus próprios registros
CREATE POLICY "Users can view their own progress" 
ON public.progress 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Criar política UPDATE para progress - usuários podem atualizar apenas seus próprios registros
CREATE POLICY "Users can update their own progress" 
ON public.progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 3. Criar política DELETE para progress - usuários podem deletar apenas seus próprios registros
CREATE POLICY "Users can delete their own progress" 
ON public.progress 
FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Log da correção para auditoria
INSERT INTO public.audit_logs (
  event_type,
  action,
  details
) VALUES (
  'rls_policy_fix',
  'add_missing_progress_policies',
  jsonb_build_object(
    'table_name', 'progress',
    'policies_added', ARRAY['SELECT', 'UPDATE', 'DELETE'],
    'reason', 'Missing RLS policies preventing solution implementation functionality',
    'fix_description', 'Added SELECT, UPDATE, DELETE policies to allow users to manage their own progress records',
    'timestamp', NOW()
  )
);
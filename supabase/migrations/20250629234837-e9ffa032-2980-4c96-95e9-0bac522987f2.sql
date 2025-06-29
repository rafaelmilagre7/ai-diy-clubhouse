
-- Adicionar foreign keys para a tabela community_reports
-- Isso resolverá os erros de JOIN que causam os tooltips de erro na comunidade

-- Primeiro, vamos limpar qualquer dado inconsistente que possa existir
DELETE FROM public.community_reports 
WHERE reporter_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = reporter_id);

DELETE FROM public.community_reports 
WHERE reported_user_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = reported_user_id);

DELETE FROM public.community_reports 
WHERE reviewed_by IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = reviewed_by);

-- Adicionar as foreign key constraints
ALTER TABLE public.community_reports 
ADD CONSTRAINT fk_community_reports_reporter_id 
FOREIGN KEY (reporter_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.community_reports 
ADD CONSTRAINT fk_community_reports_reported_user_id 
FOREIGN KEY (reported_user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.community_reports 
ADD CONSTRAINT fk_community_reports_reviewed_by 
FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Adicionar índices para melhorar performance das queries com JOIN
CREATE INDEX IF NOT EXISTS idx_community_reports_reporter_id 
ON public.community_reports(reporter_id);

CREATE INDEX IF NOT EXISTS idx_community_reports_reported_user_id 
ON public.community_reports(reported_user_id);

CREATE INDEX IF NOT EXISTS idx_community_reports_reviewed_by 
ON public.community_reports(reviewed_by);

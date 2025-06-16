
-- Migração de Correção de Segurança RLS - Versão Simplificada
-- Corrige os problemas de segurança identificados

-- ETAPA 1: Habilitar RLS nas tabelas que têm políticas mas RLS desabilitado
ALTER TABLE public.admin_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefit_access_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefit_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connection_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connection_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_access_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_access_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.implementation_checkpoints ENABLE ROW LEVEL SECURITY;

-- ETAPA 2: Habilitar RLS nas tabelas sem proteção
ALTER TABLE public.implementation_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.implementation_trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_courses ENABLE ROW LEVEL SECURITY;

-- ETAPA 3: Criar políticas básicas para as tabelas que não tinham proteção

-- Políticas para implementation_profiles (usuários podem ver/editar seus próprios dados)
CREATE POLICY "Users can manage own implementation profiles" ON public.implementation_profiles
  FOR ALL USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  );

-- Políticas para implementation_trails (usuários podem ver/editar suas próprias trilhas)
CREATE POLICY "Users can manage own implementation trails" ON public.implementation_trails
  FOR ALL USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  );

-- Políticas para invites (apenas admins)
CREATE POLICY "Only admins can manage invites" ON public.invites
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  );

-- Políticas para learning_certificates (usuários podem ver seus próprios certificados)
CREATE POLICY "Users can view own certificates" ON public.learning_certificates
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  );

CREATE POLICY "System can create certificates" ON public.learning_certificates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para learning_comment_likes (usuários podem curtir comentários)
CREATE POLICY "Users can manage comment likes" ON public.learning_comment_likes
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para learning_comments (usuários podem ver e gerenciar seus comentários)
CREATE POLICY "Users can view comments" ON public.learning_comments
  FOR SELECT USING (
    NOT is_hidden OR 
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  );

CREATE POLICY "Users can manage own comments" ON public.learning_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.learning_comments
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  );

-- Políticas para learning_courses (usuários podem ver cursos publicados)
CREATE POLICY "Users can view published courses" ON public.learning_courses
  FOR SELECT USING (
    published = true OR 
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  );

CREATE POLICY "Only admins can manage courses" ON public.learning_courses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  );

CREATE POLICY "Only admins can update courses" ON public.learning_courses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  );

-- ETAPA 4: Criar função robusta para logs de auditoria
CREATE OR REPLACE FUNCTION public.log_security_access(
  p_table_name text,
  p_operation text,
  p_resource_id text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir log de auditoria apenas se o usuário estiver autenticado
  IF auth.uid() IS NOT NULL THEN
    BEGIN
      INSERT INTO public.audit_logs (
        user_id,
        event_type,
        action,
        resource_id,
        details,
        severity
      ) VALUES (
        auth.uid(),
        'data_access',
        p_operation,
        p_resource_id,
        jsonb_build_object(
          'table_name', p_table_name,
          'operation', p_operation,
          'timestamp', NOW()
        ),
        'low'
      );
    EXCEPTION
      WHEN OTHERS THEN
        -- Falhar silenciosamente para não interromper operações principais
        NULL;
    END;
  END IF;
END;
$$;

-- Comentário de documentação
COMMENT ON FUNCTION public.log_security_access(text, text, text) IS 
'Função robusta para registrar acessos de segurança sem interromper operações principais';

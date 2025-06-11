
-- FASE 3: SISTEMA DE SEGURANÇA AVANÇADO
-- =====================================
-- Criação das estruturas de banco para logs, alertas e monitoramento em tempo real

-- TABELA PARA LOGS DE SEGURANÇA REAIS
-- ===================================
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('auth', 'access', 'data', 'system', 'security')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  location JSONB, -- Para dados de geolocalização
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed BOOLEAN DEFAULT false,
  correlation_id UUID -- Para correlacionar eventos relacionados
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON public.security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON public.security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON public.security_logs(severity);
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON public.security_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_correlation ON public.security_logs(correlation_id);

-- TABELA PARA INCIDENTES DE SEGURANÇA
-- ===================================
CREATE TABLE IF NOT EXISTS public.security_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  related_logs UUID[], -- Array de IDs de logs relacionados
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Índices para incidentes
CREATE INDEX IF NOT EXISTS idx_security_incidents_severity ON public.security_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_security_incidents_status ON public.security_incidents(status);
CREATE INDEX IF NOT EXISTS idx_security_incidents_created_at ON public.security_incidents(created_at DESC);

-- TABELA PARA MÉTRICAS DE SEGURANÇA
-- =================================
CREATE TABLE IF NOT EXISTS public.security_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('counter', 'gauge', 'histogram')),
  labels JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para métricas
CREATE INDEX IF NOT EXISTS idx_security_metrics_name ON public.security_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_security_metrics_recorded_at ON public.security_metrics(recorded_at DESC);

-- TABELA PARA ANOMALIAS DETECTADAS
-- ================================
CREATE TABLE IF NOT EXISTS public.security_anomalies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  anomaly_type TEXT NOT NULL,
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
  description TEXT,
  affected_user_id UUID REFERENCES auth.users(id),
  detection_data JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'detected' CHECK (status IN ('detected', 'confirmed', 'false_positive', 'resolved')),
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Índices para anomalias
CREATE INDEX IF NOT EXISTS idx_security_anomalies_type ON public.security_anomalies(anomaly_type);
CREATE INDEX IF NOT EXISTS idx_security_anomalies_user ON public.security_anomalies(affected_user_id);
CREATE INDEX IF NOT EXISTS idx_security_anomalies_detected_at ON public.security_anomalies(detected_at DESC);

-- POLÍTICAS RLS PARA SEGURANÇA
-- ============================

-- Ativar RLS em todas as tabelas
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_anomalies ENABLE ROW LEVEL SECURITY;

-- Políticas para security_logs (apenas admins podem ver)
CREATE POLICY "security_logs_admin_access" ON public.security_logs
  FOR ALL USING (public.is_user_admin(auth.uid()));

-- Políticas para security_incidents (apenas admins podem ver)
CREATE POLICY "security_incidents_admin_access" ON public.security_incidents
  FOR ALL USING (public.is_user_admin(auth.uid()));

-- Políticas para security_metrics (apenas admins podem ver)
CREATE POLICY "security_metrics_admin_access" ON public.security_metrics
  FOR ALL USING (public.is_user_admin(auth.uid()));

-- Políticas para security_anomalies (apenas admins podem ver)
CREATE POLICY "security_anomalies_admin_access" ON public.security_anomalies
  FOR ALL USING (public.is_user_admin(auth.uid()));

-- FUNÇÕES DE SEGURANÇA AVANÇADAS
-- ==============================

-- Função para inserir logs de segurança de forma segura
CREATE OR REPLACE FUNCTION public.log_security_access(
  p_table_name TEXT,
  p_operation TEXT,
  p_resource_id TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Função robusta que nunca falha, mesmo em caso de erro
  BEGIN
    INSERT INTO public.security_logs (
      user_id,
      event_type,
      severity,
      action,
      resource_type,
      resource_id,
      details,
      ip_address,
      user_agent
    ) VALUES (
      auth.uid(),
      'access',
      'low',
      p_operation,
      p_table_name,
      p_resource_id,
      jsonb_build_object(
        'timestamp', now(),
        'function', 'log_security_access'
      ),
      current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
      current_setting('request.headers', true)::jsonb->>'user-agent'
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Falhar silenciosamente para não quebrar funcionalidades
      NULL;
  END;
END;
$$;

-- Função para detectar anomalias simples
CREATE OR REPLACE FUNCTION public.detect_login_anomaly(
  p_user_id UUID,
  p_ip_address TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recent_ips TEXT[];
  login_count INTEGER;
BEGIN
  -- Verificar IPs recentes do usuário (últimos 7 dias)
  SELECT array_agg(DISTINCT ip_address) INTO recent_ips
  FROM public.security_logs
  WHERE user_id = p_user_id
    AND event_type = 'auth'
    AND action = 'login_success'
    AND timestamp > now() - INTERVAL '7 days';
  
  -- Verificar tentativas de login na última hora
  SELECT COUNT(*) INTO login_count
  FROM public.security_logs
  WHERE user_id = p_user_id
    AND event_type = 'auth'
    AND timestamp > now() - INTERVAL '1 hour';
  
  -- Detectar anomalias
  IF p_ip_address IS NOT NULL AND recent_ips IS NOT NULL THEN
    -- IP novo + muitas tentativas = suspeito
    IF NOT (p_ip_address = ANY(recent_ips)) AND login_count > 5 THEN
      INSERT INTO public.security_anomalies (
        anomaly_type,
        confidence_score,
        description,
        affected_user_id,
        detection_data
      ) VALUES (
        'suspicious_login_pattern',
        0.8,
        'Login de IP não usual com alta frequência',
        p_user_id,
        jsonb_build_object(
          'ip_address', p_ip_address,
          'login_count', login_count,
          'known_ips', recent_ips
        )
      );
      RETURN TRUE;
    END IF;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Função para gerar métricas de segurança
CREATE OR REPLACE FUNCTION public.generate_security_metrics()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Limpar métricas antigas (mais de 30 dias)
  DELETE FROM public.security_metrics 
  WHERE recorded_at < now() - INTERVAL '30 days';
  
  -- Contar eventos por severidade nas últimas 24h
  INSERT INTO public.security_metrics (metric_name, metric_value, metric_type, labels)
  SELECT 
    'security_events_by_severity',
    COUNT(*),
    'counter',
    jsonb_build_object('severity', severity, 'period', '24h')
  FROM public.security_logs
  WHERE timestamp > now() - INTERVAL '24 hours'
  GROUP BY severity;
  
  -- Contar usuários ativos nas últimas 24h
  INSERT INTO public.security_metrics (metric_name, metric_value, metric_type)
  SELECT 
    'active_users_24h',
    COUNT(DISTINCT user_id),
    'gauge'
  FROM public.security_logs
  WHERE timestamp > now() - INTERVAL '24 hours';
  
  -- Contar anomalias detectadas nas últimas 24h
  INSERT INTO public.security_metrics (metric_name, metric_value, metric_type)
  SELECT 
    'anomalies_detected_24h',
    COUNT(*),
    'counter'
  FROM public.security_anomalies
  WHERE detected_at > now() - INTERVAL '24 hours';
END;
$$;

-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- ====================================

-- Trigger para atualizar updated_at em security_incidents
CREATE OR REPLACE FUNCTION public.update_security_incidents_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER security_incidents_update_timestamp
  BEFORE UPDATE ON public.security_incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_security_incidents_timestamp();

-- REALTIME PARA DASHBOARD
-- =======================

-- Ativar realtime para as tabelas de segurança
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_anomalies;

-- Configurar replica identity para dados completos
ALTER TABLE public.security_logs REPLICA IDENTITY FULL;
ALTER TABLE public.security_incidents REPLICA IDENTITY FULL;
ALTER TABLE public.security_metrics REPLICA IDENTITY FULL;
ALTER TABLE public.security_anomalies REPLICA IDENTITY FULL;

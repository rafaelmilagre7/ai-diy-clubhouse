
-- Configurar um job agendado para atualizar vídeos diariamente
-- Isso requer as extensões pg_cron e pg_net que já devem estar instaladas
DO $$
BEGIN
  -- Verificar se a extensão pg_cron está disponível
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    -- Criar ou atualizar o job agendado para executar todos os dias às 2 da manhã
    PERFORM cron.schedule(
      'atualizar-duracoes-videos-diario',
      '0 2 * * *', -- Todo dia às 2 da manhã
      $$
        -- Esta função irá chamar a edge function update-video-durations
        -- para processar todos os vídeos sem duração no sistema
        SELECT net.http_post(
          url := 'https://zotzvtepvpnkcoobdubt.supabase.co/functions/v1/update-video-durations',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
          ),
          body := '{}'::jsonb
        );
      $$
    );
    
    RAISE NOTICE 'Job agendado para atualização de vídeos criado com sucesso';
  ELSE
    RAISE NOTICE 'A extensão pg_cron não está disponível. Job não criado.';
  END IF;
  
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao criar job agendado: %', SQLERRM;
END $$;

-- Criar função de trigger para atualização automática em novos vídeos
CREATE OR REPLACE FUNCTION public.trigger_update_video_durations()
RETURNS TRIGGER AS $$
DECLARE
  api_url TEXT := 'https://zotzvtepvpnkcoobdubt.supabase.co/functions/v1/update-video-durations';
  api_key TEXT;
  video_id TEXT;
BEGIN
  -- Só processar vídeos do Panda que não têm duração definida
  IF NEW.video_type = 'panda' AND (NEW.duration_seconds IS NULL OR NEW.duration_seconds = 0) THEN
    -- Tentar obter a API key
    BEGIN
      api_key := current_setting('app.settings.service_role_key', true);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Não foi possível obter a chave de API. Continuando sem atualização automática.';
      RETURN NEW;
    END;

    -- Verificar se pg_net está disponível
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
      -- Chamar a edge function para atualizar o vídeo
      PERFORM net.http_post(
        url := api_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || api_key
        ),
        body := jsonb_build_object(
          'lessonId', NEW.lesson_id,
          'videoId', NEW.id
        )
      );
      
      RAISE NOTICE 'Solicitação de atualização de duração enviada para o vídeo %', NEW.id;
    ELSE
      RAISE NOTICE 'A extensão pg_net não está disponível. Não foi possível enviar a solicitação de atualização.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para novos vídeos inseridos
DROP TRIGGER IF EXISTS trigger_video_duration_update ON learning_lesson_videos;
CREATE TRIGGER trigger_video_duration_update
AFTER INSERT ON learning_lesson_videos
FOR EACH ROW
EXECUTE FUNCTION public.trigger_update_video_durations();

RAISE NOTICE 'Trigger para atualização automática de durações configurado com sucesso';

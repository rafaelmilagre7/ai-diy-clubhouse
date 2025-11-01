-- Função para criar notificação quando nova mensagem chega
CREATE OR REPLACE FUNCTION public.create_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar notificação para o destinatário
  INSERT INTO public.notifications (
    user_id,
    actor_id,
    type,
    category,
    title,
    message,
    action_url,
    priority,
    data
  )
  VALUES (
    NEW.recipient_id,
    NEW.sender_id,
    'new_message',
    'social',
    'Nova mensagem',
    SUBSTRING(NEW.content, 1, 100), -- Preview da mensagem (primeiros 100 caracteres)
    '/networking/messages',
    'normal',
    jsonb_build_object(
      'message_id', NEW.id,
      'sender_id', NEW.sender_id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para criar notificação quando nova mensagem é inserida
DROP TRIGGER IF EXISTS on_new_direct_message ON public.direct_messages;
CREATE TRIGGER on_new_direct_message
  AFTER INSERT ON public.direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.create_message_notification();

-- Comentários para documentação
COMMENT ON FUNCTION public.create_message_notification() IS 'Cria notificação automática quando uma nova mensagem direta é enviada';
COMMENT ON TRIGGER on_new_direct_message ON public.direct_messages IS 'Trigger que chama create_message_notification() quando uma nova mensagem é inserida';
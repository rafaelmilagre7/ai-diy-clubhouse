import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPreferences {
  user_id: string;
  learning_comments: boolean;
  learning_new_lessons: boolean;
  community_replies: boolean;
  networking_messages: boolean;
  networking_opportunities: boolean;
  solutions_comments: boolean;
  admin_communications: boolean;
  digest_frequency: string;
  quiet_hours_start: string;
  quiet_hours_end: string;
  respect_quiet_hours: boolean;
  in_app_enabled: boolean;
}

interface QueueItem {
  id: string;
  user_id: string;
  event_type: string;
  event_data: any;
  created_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔔 Iniciando processamento de notificações...');

    // Buscar eventos não processados
    const { data: queueItems, error: queueError } = await supabaseClient
      .from('notification_queue')
      .select('*')
      .eq('processed', false)
      .order('created_at', { ascending: true })
      .limit(100);

    if (queueError) {
      console.error('Erro ao buscar fila:', queueError);
      throw queueError;
    }

    if (!queueItems || queueItems.length === 0) {
      console.log('✅ Nenhuma notificação na fila');
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: 'Nenhuma notificação para processar' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`📬 ${queueItems.length} itens na fila`);

    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const item of queueItems as QueueItem[]) {
      try {
        // Buscar preferências do usuário
        const { data: prefs, error: prefsError } = await supabaseClient
          .from('notification_preferences')
          .select('*')
          .eq('user_id', item.user_id)
          .single();

        if (prefsError && prefsError.code !== 'PGRST116') {
          console.error(`Erro ao buscar preferências para ${item.user_id}:`, prefsError);
          errorCount++;
          continue;
        }

        // Verificar se usuário quer receber este tipo
        const shouldNotify = checkUserPreference(prefs, item.event_type);
        
        if (!shouldNotify) {
          console.log(`⏭️  Usuário ${item.user_id} não quer receber ${item.event_type}`);
          skippedCount++;
          await markAsProcessed(supabaseClient, item.id);
          continue;
        }

        // Verificar quiet hours
        if (prefs?.respect_quiet_hours && isQuietHours(prefs)) {
          console.log(`🌙 Quiet hours para usuário ${item.user_id}, adiando notificação`);
          continue; // Deixar para processar depois
        }

        // Criar notificação
        const notification = await createNotification(
          supabaseClient,
          item.user_id,
          item.event_type,
          item.event_data
        );

        if (notification) {
          console.log(`✅ Notificação criada: ${item.event_type} para ${item.user_id}`);
          processedCount++;
          await markAsProcessed(supabaseClient, item.id);
        }
      } catch (error) {
        console.error(`Erro ao processar item ${item.id}:`, error);
        errorCount++;
      }
    }

    console.log(`📊 Resumo: ${processedCount} processadas, ${skippedCount} puladas, ${errorCount} erros`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        skipped: skippedCount,
        errors: errorCount,
        remaining: (queueItems?.length || 0) - processedCount - skippedCount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function checkUserPreference(prefs: NotificationPreferences | null, eventType: string): boolean {
  if (!prefs || !prefs.in_app_enabled) return false;
  
  const categoryMap: Record<string, keyof NotificationPreferences> = {
    'learning_comment_reply': 'learning_comments',
    'learning_comment_new': 'learning_comments',
    'learning_new_lesson': 'learning_new_lessons',
    'community_reply': 'community_replies',
    'community_topic_activity': 'community_replies',
    'marketplace_opportunity': 'networking_opportunities',
    'networking_message': 'networking_messages',
  };
  
  const prefKey = categoryMap[eventType];
  if (!prefKey) return true;
  
  return prefs[prefKey] !== false;
}

function isQuietHours(prefs: NotificationPreferences): boolean {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 60 + minutes;
  
  const startParts = prefs.quiet_hours_start?.split(':') || ['22', '00'];
  const endParts = prefs.quiet_hours_end?.split(':') || ['08', '00'];
  
  const startTime = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
  const endTime = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
  
  if (startTime < endTime) {
    return currentTime >= startTime && currentTime < endTime;
  } else {
    return currentTime >= startTime || currentTime < endTime;
  }
}

async function createNotification(
  supabase: any,
  userId: string,
  eventType: string,
  eventData: any
) {
  // Buscar informações do autor
  const { data: author } = await supabase
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', eventData.author_id)
    .single();

  const notificationData = formatNotification(eventType, eventData, author);
  
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type: eventType,
      title: notificationData.title,
      message: notificationData.message,
      data: eventData,
      priority: notificationData.priority,
      category: notificationData.category,
      action_url: notificationData.action_url
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar notificação:', error);
    return null;
  }

  return data;
}

function formatNotification(eventType: string, eventData: any, author: any) {
  const authorName = author?.name || 'Alguém';
  
  const templates: Record<string, any> = {
    'learning_comment_reply': {
      title: `${authorName} respondeu seu comentário`,
      message: `Nova resposta: "${eventData.content?.substring(0, 60)}..."`,
      priority: 7,
      category: 'learning',
      action_url: `/learning/lesson/${eventData.lesson_id}#comment-${eventData.comment_id}`
    },
    'learning_comment_new': {
      title: `Novo comentário na sua lição`,
      message: `${authorName}: "${eventData.content?.substring(0, 60)}..."`,
      priority: 6,
      category: 'learning',
      action_url: `/learning/lesson/${eventData.lesson_id}#comment-${eventData.comment_id}`
    },
    'learning_new_lesson': {
      title: `Nova lição disponível!`,
      message: `Confira: ${eventData.title}`,
      priority: 5,
      category: 'learning',
      action_url: `/learning/lesson/${eventData.lesson_id}`
    },
    'community_reply': {
      title: `${authorName} respondeu seu post`,
      message: `Nova resposta na comunidade`,
      priority: 7,
      category: 'community',
      action_url: `/community/topic/${eventData.topic_id}#post-${eventData.post_id}`
    },
    'community_topic_activity': {
      title: `Atividade no seu tópico`,
      message: `${authorName} comentou no seu tópico`,
      priority: 6,
      category: 'community',
      action_url: `/community/topic/${eventData.topic_id}`
    },
    'marketplace_opportunity': {
      title: `Nova oportunidade: ${eventData.title}`,
      message: `${eventData.type} - Confira no marketplace`,
      priority: 5,
      category: 'networking',
      action_url: `/marketplace?id=${eventData.opportunity_id}`
    },
    'networking_message': {
      title: `${authorName} enviou uma mensagem`,
      message: eventData.content?.substring(0, 60) || 'Nova mensagem',
      priority: 8,
      category: 'networking',
      action_url: `/networking?conversation=${eventData.conversation_id}`
    }
  };
  
  return templates[eventType] || {
    title: 'Nova notificação',
    message: 'Você tem uma nova notificação',
    priority: 5,
    category: 'general',
    action_url: '/'
  };
}

async function markAsProcessed(supabase: any, queueId: string) {
  await supabase
    .from('notification_queue')
    .update({ processed: true, processed_at: new Date().toISOString() })
    .eq('id', queueId);
}

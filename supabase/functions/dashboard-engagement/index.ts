import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    // Verificar se é admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*, user_roles(*)')
      .eq('id', user.id)
      .single();

    if (!profile?.user_roles?.name || profile.user_roles.name !== 'admin') {
      return new Response('Forbidden', { status: 403, headers: corsHeaders });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Buscar dados de engajamento
    const [
      totalActivityResult,
      weeklyActivityResult,
      solutionsProgressResult,
      learningProgressResult,
      communityActivityResult,
      retentionResult
    ] = await Promise.all([
      // Atividade total (30 dias)
      supabase
        .from('analytics')
        .select('id, event_type', { count: 'exact' })
        .gte('created_at', thirtyDaysAgo),
      
      // Atividade semanal
      supabase
        .from('analytics')
        .select('id, event_type', { count: 'exact' })
        .gte('created_at', sevenDaysAgo),
      
      // Progresso em soluções
      supabase
        .from('progress')
        .select('id, is_completed', { count: 'exact' }),
      
      // Progresso em learning
      supabase
        .from('learning_progress')
        .select('id, progress_percentage', { count: 'exact' }),
      
      // Atividade da comunidade
      supabase
        .from('community_topics')
        .select('id, reply_count', { count: 'exact' })
        .gte('created_at', thirtyDaysAgo),
      
      // Usuários que voltaram (retenção)
      supabase
        .from('analytics')
        .select('user_id')
        .gte('created_at', sevenDaysAgo)
    ]);

    // Calcular métricas de engajamento
    const uniqueActiveUsers = new Set(retentionResult.data?.map(r => r.user_id) || []).size;
    
    // Buscar eventos por tipo nos últimos 7 dias
    const { data: eventsByType } = await supabase
      .from('analytics')
      .select('event_type, created_at')
      .gte('created_at', sevenDaysAgo);

    const eventTypeDistribution: Record<string, number> = {};
    eventsByType?.forEach(event => {
      eventTypeDistribution[event.event_type] = (eventTypeDistribution[event.event_type] || 0) + 1;
    });

    // Atividade diária dos últimos 7 dias
    const dailyActivity: Record<string, number> = {};
    eventsByType?.forEach(event => {
      const day = event.created_at.split('T')[0]; // YYYY-MM-DD
      dailyActivity[day] = (dailyActivity[day] || 0) + 1;
    });

    const dashboardData = {
      metrics: {
        totalEvents: totalActivityResult.count || 0,
        weeklyEvents: weeklyActivityResult.count || 0,
        activeUsers: uniqueActiveUsers,
        completedSolutions: solutionsProgressResult.data?.filter(p => p.is_completed).length || 0,
        learningActivities: learningProgressResult.count || 0,
        communityPosts: communityActivityResult.count || 0
      },
      activity: {
        daily: dailyActivity,
        byEventType: eventTypeDistribution,
        trend: (weeklyActivityResult.count || 0) > ((totalActivityResult.count || 0) / 4) ? 'increasing' : 'stable'
      },
      engagement: {
        avgProgressPerUser: (learningProgressResult.count || 0) > 0 && uniqueActiveUsers > 0
          ? Math.round((learningProgressResult.count || 0) / uniqueActiveUsers * 100) / 100
          : 0,
        communityEngagement: {
          totalTopics: communityActivityResult.count || 0,
          avgRepliesPerTopic: (communityActivityResult.data && communityActivityResult.data.length > 0)
            ? Math.round((communityActivityResult.data.reduce((sum, topic) => sum + (topic.reply_count || 0), 0) / communityActivityResult.data.length) * 100) / 100
            : 0
        }
      },
      retention: {
        weeklyActiveUsers: uniqueActiveUsers,
        returnRate: uniqueActiveUsers > 0 ? Math.round((uniqueActiveUsers / (totalActivityResult.count || 1)) * 100) : 0
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        cacheFor: 300,
        dataRange: '30 days'
      }
    };

    return new Response(JSON.stringify(dashboardData), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    });

  } catch (error) {
    console.error('Error in dashboard-engagement function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
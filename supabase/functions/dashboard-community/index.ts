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

    // Buscar dados da comunidade
    const [
      topicsResult,
      postsResult,
      reactionsResult,
      reportsResult,
      categoriesResult,
      recentTopicsResult,
      recentPostsResult
    ] = await Promise.all([
      // Tópicos totais e recentes
      supabase
        .from('community_topics')
        .select('id, created_at, reply_count, view_count, user_id', { count: 'exact' }),
      
      // Posts totais e recentes
      supabase
        .from('community_posts')
        .select('id, created_at, user_id, topic_id', { count: 'exact' }),
      
      // Reações
      supabase
        .from('community_reactions')
        .select('id, reaction_type, created_at', { count: 'exact' })
        .gte('created_at', thirtyDaysAgo),
      
      // Relatórios de moderação
      supabase
        .from('community_reports')
        .select('id, status, created_at', { count: 'exact' })
        .gte('created_at', thirtyDaysAgo),
      
      // Categorias ativas
      supabase
        .from('community_categories')
        .select('id, name, topic_count', { count: 'exact' })
        .eq('is_active', true),
      
      // Tópicos recentes (7 dias)
      supabase
        .from('community_topics')
        .select('id, created_at, user_id', { count: 'exact' })
        .gte('created_at', sevenDaysAgo),
      
      // Posts recentes (7 dias)
      supabase
        .from('community_posts')
        .select('id, created_at, user_id', { count: 'exact' })
        .gte('created_at', sevenDaysAgo)
    ]);

    // Calcular usuários únicos ativos na comunidade
    const uniqueTopicCreators = new Set(topicsResult.data?.map(t => t.user_id) || []).size;
    const uniquePostCreators = new Set(postsResult.data?.map(p => p.user_id) || []).size;
    const totalActiveCommunityUsers = new Set([
      ...(topicsResult.data?.map(t => t.user_id) || []),
      ...(postsResult.data?.map(p => p.user_id) || [])
    ]).size;

    // Atividade por dia nos últimos 7 dias
    const dailyActivity = {};
    [...(recentTopicsResult.data || []), ...(recentPostsResult.data || [])].forEach(item => {
      const day = item.created_at.split('T')[0];
      dailyActivity[day] = (dailyActivity[day] || 0) + 1;
    });

    // Distribuição de reações por tipo
    const reactionDistribution = {};
    reactionsResult.data?.forEach(reaction => {
      reactionDistribution[reaction.reaction_type] = (reactionDistribution[reaction.reaction_type] || 0) + 1;
    });

    // Status dos reports
    const reportStatusDistribution = {};
    reportsResult.data?.forEach(report => {
      reportStatusDistribution[report.status] = (reportStatusDistribution[report.status] || 0) + 1;
    });

    // Métricas de engajamento por categoria
    const categoryEngagement = {};
    categoriesResult.data?.forEach(category => {
      categoryEngagement[category.name] = {
        topicCount: category.topic_count || 0,
        id: category.id
      };
    });

    const dashboardData = {
      overview: {
        totalTopics: topicsResult.count || 0,
        totalPosts: postsResult.count || 0,
        totalReactions: reactionsResult.count || 0,
        activeUsers: totalActiveCommunityUsers,
        weeklyNewTopics: recentTopicsResult.count || 0,
        weeklyNewPosts: recentPostsResult.count || 0
      },
      engagement: {
        avgRepliesPerTopic: topicsResult.data?.length > 0
          ? Math.round((topicsResult.data.reduce((sum, topic) => sum + (topic.reply_count || 0), 0) / topicsResult.data.length) * 100) / 100
          : 0,
        avgViewsPerTopic: topicsResult.data?.length > 0
          ? Math.round((topicsResult.data.reduce((sum, topic) => sum + (topic.view_count || 0), 0) / topicsResult.data.length) * 100) / 100
          : 0,
        reactionsByType: reactionDistribution,
        dailyActivity: dailyActivity
      },
      users: {
        topicCreators: uniqueTopicCreators,
        postCreators: uniquePostCreators,
        totalActive: totalActiveCommunityUsers,
        participationRate: totalActiveCommunityUsers > 0 
          ? Math.round((totalActiveCommunityUsers / (topicsResult.count || 1)) * 100) 
          : 0
      },
      moderation: {
        totalReports: reportsResult.count || 0,
        reportsByStatus: reportStatusDistribution,
        weeklyReports: reportsResult.count || 0,
        moderationRate: reportsResult.count > 0 
          ? Math.round(((reportsResult.data?.filter(r => r.status === 'resolved').length || 0) / reportsResult.count) * 100)
          : 100
      },
      categories: {
        total: categoriesResult.count || 0,
        engagement: categoryEngagement,
        mostActive: categoriesResult.data?.sort((a, b) => (b.topic_count || 0) - (a.topic_count || 0)).slice(0, 5) || []
      },
      health: {
        growthRate: recentTopicsResult.count > 0 ? 'growing' : 'stable',
        engagementTrend: reactionsResult.count > (postsResult.count * 0.1) ? 'high' : 'moderate',
        communityScore: Math.min(100, Math.round(
          (totalActiveCommunityUsers * 20) + 
          (reactionsResult.count * 5) + 
          ((reportsResult.data?.filter(r => r.status === 'resolved').length || 0) * 10)
        ))
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
    console.error('Error in dashboard-community function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
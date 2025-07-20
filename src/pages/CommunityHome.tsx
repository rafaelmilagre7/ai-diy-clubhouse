import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, TrendingUp, Plus } from 'lucide-react';
import { SearchBox } from '@/components/community/SearchBox';
import { ActivityFeed } from '@/components/community/ActivityFeed';
import { TrendingWidget } from '@/components/community/TrendingWidget';
import { StatsCard } from '@/components/community/StatsCard';
import { CreateTopicDialog } from '@/components/community/CreateTopicDialog';

export const CommunityHome = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateTopicOpen, setIsCreateTopicOpen] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ['community-stats'],
    queryFn: async () => {
      const [topicsResult, postsResult, usersResult] = await Promise.all([
        supabase.from('forum_topics').select('*', { count: 'exact', head: true }),
        supabase.from('forum_posts').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
      ]);

      return {
        topics: topicsResult.count || 0,
        posts: postsResult.count || 0,
        users: usersResult.count || 0
      };
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['forum-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: activeUsers } = useQuery({
    queryKey: ['active-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .limit(8);
      
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comunidade</h1>
          <p className="text-gray-600">Conecte-se, compartilhe e aprenda com outros membros</p>
        </div>
        <Button onClick={() => setIsCreateTopicOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Tópico
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Tópicos"
          value={stats?.topics || 0}
          icon={MessageSquare}
          trend="+12%"
        />
        <StatsCard
          title="Discussões"
          value={stats?.posts || 0}
          icon={TrendingUp}
          trend="+8%"
        />
        <StatsCard
          title="Membros Ativos"
          value={stats?.users || 0}
          icon={Users}
          trend="+5%"
        />
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <SearchBox
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <ActivityFeed searchQuery={searchQuery} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trending Topics */}
          <TrendingWidget />

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categorias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories?.map((category) => (
                <div key={category.id} className="flex items-center justify-between">
                  <Badge variant="outline">{category.name}</Badge>
                  <span className="text-sm text-gray-500">
                    {category.topic_count || 0} tópicos
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Active Users */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Membros Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {activeUsers?.map((user) => (
                  <div key={user.id} className="flex flex-col items-center text-center">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>
                        {user.name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs mt-1 truncate w-full">
                      {user.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Topic Dialog */}
      <CreateTopicDialog
        isOpen={isCreateTopicOpen}
        onClose={() => setIsCreateTopicOpen(false)}
      />
    </div>
  );
};

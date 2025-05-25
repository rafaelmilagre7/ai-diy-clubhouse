
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { ForumCategories } from '@/components/community/forum/ForumCategories';
import { ForumTopics } from '@/components/community/forum/ForumTopics';

export const ForumSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('recent');

  const filters = [
    { id: 'recent', label: 'Recentes', icon: Clock },
    { id: 'trending', label: 'Em Alta', icon: TrendingUp },
    { id: 'solved', label: 'Resolvidos', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar discussões, tópicos ou soluções..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter.id)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <filter.icon className="h-4 w-4" />
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Categories Overview */}
      <ForumCategories />

      {/* Recent Topics */}
      <ForumTopics searchQuery={searchQuery} filter={activeFilter} />
    </div>
  );
};

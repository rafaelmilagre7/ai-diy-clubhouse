
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Users, Lightbulb, Calendar } from 'lucide-react';

export const CommunityTabs = () => {
  return (
    <div className="mb-6">
      <Tabs defaultValue="forum" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
          <TabsTrigger value="forum" className="flex items-center gap-2 p-3">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Fórum</span>
          </TabsTrigger>
          
          <TabsTrigger value="members" className="flex items-center gap-2 p-3">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Membros</span>
          </TabsTrigger>
          
          <TabsTrigger value="suggestions" className="flex items-center gap-2 p-3">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">Sugestões</span>
          </TabsTrigger>
          
          <TabsTrigger value="events" className="flex items-center gap-2 p-3">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Eventos</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

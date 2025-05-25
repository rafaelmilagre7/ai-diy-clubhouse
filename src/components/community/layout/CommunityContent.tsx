
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ForumSection } from '@/components/community/sections/ForumSection';
import { MembersSection } from '@/components/community/sections/MembersSection';
import { SuggestionsSection } from '@/components/community/sections/SuggestionsSection';
import { EventsSection } from '@/components/community/sections/EventsSection';

export const CommunityContent = () => {
  return (
    <Tabs defaultValue="forum" className="w-full">
      <TabsContent value="forum" className="mt-0">
        <ForumSection />
      </TabsContent>
      
      <TabsContent value="members" className="mt-0">
        <MembersSection />
      </TabsContent>
      
      <TabsContent value="suggestions" className="mt-0">
        <SuggestionsSection />
      </TabsContent>
      
      <TabsContent value="events" className="mt-0">
        <EventsSection />
      </TabsContent>
    </Tabs>
  );
};

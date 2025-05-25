
import React from 'react';
import { CommunityHeader } from '@/components/community/layout/CommunityHeader';
import { CommunityTabs } from '@/components/community/layout/CommunityTabs';
import { CommunityContent } from '@/components/community/layout/CommunityContent';

export const CommunityPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto py-6 px-4">
        <CommunityHeader />
        <CommunityTabs />
        <CommunityContent />
      </div>
    </div>
  );
};

export default CommunityPage;

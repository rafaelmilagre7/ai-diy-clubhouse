
import React from 'react';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { ForumHeader } from '@/components/community/ForumHeader';
import { CategoryList } from '@/components/community/CategoryList';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';

const Forum = () => {
  return (
    <div className="container max-w-7xl mx-auto py-6">
      <ForumBreadcrumbs 
        section="forum"
        sectionTitle="Fórum"
      />
      
      <ForumHeader
        title="Fórum da Comunidade"
        description="Compartilhe conhecimentos e troque experiências com outros membros"
        showNewTopicButton={true}
      />
      
      <CommunityNavigation />
      
      <div className="mt-6">
        <CategoryList />
      </div>
    </div>
  );
};

export default Forum;

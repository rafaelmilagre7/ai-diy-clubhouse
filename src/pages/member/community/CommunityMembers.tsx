
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { ForumHeader } from '@/components/community/ForumHeader';
import { MembersDirectory } from '@/components/community/members/MembersDirectory';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';

export const CommunityMembers = () => {
  return (
    <div className="container max-w-7xl mx-auto py-6">
      <ForumBreadcrumbs 
        section="membros"
        sectionTitle="Diretório de Membros"
      />
      
      <ForumHeader
        title="Diretório de Membros"
        description="Conecte-se com outros empresários e profissionais da comunidade."
        showNewTopicButton={false}
      />
      
      <CommunityNavigation />
      
      <MembersDirectory />
    </div>
  );
};

export default CommunityMembers;

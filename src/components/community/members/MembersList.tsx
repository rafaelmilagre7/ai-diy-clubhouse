
import { Profile } from '@/types/forumTypes';
import { MemberCard } from './MemberCard';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';

interface MembersListProps {
  members: Profile[];
  isLoading: boolean;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onConnect?: (memberId: string) => void;
  connectedMembers?: Set<string>;
}

export const MembersList = ({
  members,
  isLoading,
  totalPages,
  currentPage,
  onPageChange,
  onConnect,
  connectedMembers = new Set()
}: MembersListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-8 w-full mt-4" />
          </div>
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg bg-muted/20">
        <h3 className="text-lg font-medium">Nenhum membro encontrado</h3>
        <p className="text-muted-foreground">Tente ajustar os filtros de busca</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {members.map((member) => (
          <MemberCard 
            key={member.id} 
            member={member} 
            onConnect={onConnect}
            isConnected={connectedMembers.has(member.id)}
          />
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

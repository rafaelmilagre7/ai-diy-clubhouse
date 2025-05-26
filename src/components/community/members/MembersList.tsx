
import React from 'react';
import { MemberCard } from './MemberCard';
import { MembersSkeleton } from './MembersSkeleton';
import { EmptyMembersState } from './EmptyMembersState';
import { Pagination } from '@/components/ui/pagination';
import { Profile } from '@/types/forumTypes';

interface MembersListProps {
  members: Profile[];
  isLoading: boolean;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const MembersList = ({
  members,
  isLoading,
  totalPages,
  currentPage,
  onPageChange
}: MembersListProps) => {
  if (isLoading) {
    return <MembersSkeleton />;
  }

  if (members.length === 0) {
    return <EmptyMembersState hasFilters={false} />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage + 1}
            totalPages={totalPages}
            onPageChange={(page) => onPageChange(page - 1)}
          />
        </div>
      )}
    </div>
  );
};

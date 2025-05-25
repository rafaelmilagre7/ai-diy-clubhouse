
import React, { useState } from 'react';
import { useCommunityMembers } from '@/hooks/community/useCommunityMembers';
import { MemberCard } from '../members/MemberCard';
import { MemberFilters } from '../members/MemberFilters';
import { MembersSkeleton } from '../members/MembersSkeleton';
import { EmptyMembersState } from '../members/EmptyMembersState';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Users } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';

export const MembersSection = () => {
  const [filters, setFilters] = useState({
    search: '',
    industry: '',
    role: '',
    onlyAvailableForNetworking: false
  });

  const {
    members,
    isLoading,
    error,
    currentPage,
    totalPages,
    handlePageChange,
    availableIndustries,
    availableRoles,
    handleFilterChange,
    handleRetry
  } = useCommunityMembers(filters);

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    handleFilterChange(newFilters);
  };

  if (isLoading) {
    return <MembersSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Erro ao carregar membros. Tente novamente.</span>
          <Button variant="outline" size="sm" onClick={handleRetry}>
            Tentar Novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Membros da Comunidade</h2>
          <p className="text-muted-foreground">
            Conecte-se com outros profissionais da nossa comunidade
          </p>
        </div>
        <Button variant="outline">
          <Users className="h-4 w-4 mr-2" />
          Minhas Conexões
        </Button>
      </div>

      <MemberFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        availableIndustries={availableIndustries}
        availableRoles={availableRoles}
      />

      {members.length === 0 ? (
        <EmptyMembersState hasFilters={Object.values(filters).some(v => v)} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage + 1}
                totalPages={totalPages}
                onPageChange={(page) => handlePageChange(page - 1)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

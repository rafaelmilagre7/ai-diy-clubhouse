
import React from 'react';
import { useCommunityMembers } from '@/hooks/community/useCommunityMembers';
import { MemberCard } from './MemberCard';
import { MembersFilters } from './MembersFilters';
import { MembersPagination } from './MembersPagination';
import { Card, CardContent } from '@/components/ui/card';
import { Users, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export const MembersDirectory = () => {
  console.log('MembersDirectory renderizando - iniciando carregamento de membros');
  
  const {
    members,
    isLoading,
    isError,
    totalPages,
    currentPage,
    filters,
    availableIndustries,
    availableRoles,
    handlePageChange,
    handleFilterChange,
    handleRetry
  } = useCommunityMembers();

  console.log('MembersDirectory estado:', { 
    membersCount: members.length, 
    isLoading, 
    isError, 
    currentPage,
    totalPages 
  });

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Erro ao carregar membros da comunidade.</span>
          <Button variant="outline" size="sm" onClick={handleRetry}>
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      {/* Filtros */}
      <MembersFilters
        filters={filters}
        availableIndustries={availableIndustries}
        availableRoles={availableRoles}
        onFilterChange={handleFilterChange}
      />

      {/* Lista de membros */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="h-16 w-16 bg-muted rounded-full" />
                  <div className="space-y-2 text-center w-full">
                    <div className="h-5 bg-muted rounded w-3/4 mx-auto" />
                    <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
                    <div className="h-3 bg-muted rounded w-2/3 mx-auto" />
                  </div>
                  <div className="h-8 bg-muted rounded w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : members.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <MembersPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {filters.search.trim() ? 'Nenhum membro encontrado' : 'Carregando membros...'}
            </h3>
            <p className="text-muted-foreground">
              {filters.search.trim() 
                ? `Não encontramos membros com os filtros "${filters.search.trim()}"`
                : 'Os membros da comunidade estão sendo carregados.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

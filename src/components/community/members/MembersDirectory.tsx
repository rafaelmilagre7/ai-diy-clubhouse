
import React from 'react';
import { useCommunityMembers } from '@/hooks/community/useCommunityMembers';
import { MemberCard } from './MemberCard';
import { MembersFilters } from './MembersFilters';
import { MembersPagination } from './MembersPagination';
import { Card, CardContent } from '@/components/ui/card';
import { Users, AlertCircle, UserCheck } from 'lucide-react';
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
    totalPages,
    hasActiveFilters: !!(filters.search || filters.industry || filters.role || filters.availability)
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

  const hasActiveFilters = !!(filters.search.trim() || filters.industry || filters.role || filters.availability);

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
        <div className="space-y-4">
          <div className="text-center py-4">
            <p className="text-muted-foreground">Carregando membros da comunidade...</p>
          </div>
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
        </div>
      ) : members.length > 0 ? (
        <>
          {/* Contador de resultados */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserCheck className="h-4 w-4" />
            <span>
              {hasActiveFilters 
                ? `${members.length} membros encontrados`
                : `${members.length} membros na comunidade`
              }
            </span>
          </div>

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
              {hasActiveFilters ? 'Nenhum membro encontrado' : 'Comunidade em crescimento'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters 
                ? 'Não encontramos membros com os filtros aplicados. Tente ajustar os critérios de busca.'
                : 'Nossa comunidade está crescendo! Novos membros se juntarão em breve.'
              }
            </p>
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                onClick={() => handleFilterChange({ search: '', industry: '', role: '', availability: '' })}
              >
                Limpar filtros
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

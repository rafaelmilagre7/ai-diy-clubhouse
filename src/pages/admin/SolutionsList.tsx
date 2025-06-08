
import React from 'react';
import { useSolutionsAdmin } from '@/hooks/admin/useSolutionsAdmin';
import { SolutionsHeader } from '@/components/admin/solutions/SolutionsHeader';
import { SolutionsTable } from '@/components/admin/solutions/SolutionsTable';
import { DeleteSolutionDialog } from '@/components/admin/solutions/DeleteSolutionDialog';
import { Container } from '@/components/ui/container';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import LoadingScreen from '@/components/common/LoadingScreen';

const SolutionsList = () => {
  const {
    solutions,
    loading,
    deleteDialogOpen,
    setDeleteDialogOpen,
    solutionToDelete,
    setSolutionToDelete,
    handleDeleteConfirm
  } = useSolutionsAdmin();

  if (loading) {
    return <LoadingScreen message="Carregando soluções..." />;
  }

  return (
    <Container className="py-6">
      <div className="space-y-6">
        <SolutionsHeader />
        
        <Card className="overflow-hidden">
          {solutions.length === 0 ? (
            <div className="text-center py-10">
              <Text variant="body" textColor="secondary">Nenhuma solução encontrada.</Text>
              <Text variant="body-small" textColor="tertiary" className="mt-2">
                Crie uma nova solução para começar.
              </Text>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <SolutionsTable 
                solutions={solutions}
                onDeleteClick={(id) => {
                  setSolutionToDelete(id);
                  setDeleteDialogOpen(true);
                }}
              />
            </div>
          )}
        </Card>

        <DeleteSolutionDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </Container>
  );
};

export default SolutionsList;

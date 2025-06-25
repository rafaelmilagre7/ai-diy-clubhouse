
import React from 'react';
import { useSolutionsAdmin } from '@/hooks/admin/useSolutionsAdmin';
import { SolutionsHeader } from '@/components/admin/solutions/SolutionsHeader';
import { SolutionsTable } from '@/components/admin/solutions/SolutionsTable';
import { DeleteSolutionDialog } from '@/components/admin/solutions/DeleteSolutionDialog';

const AdminSolutions = () => {
  const {
    solutions,
    loading,
    deleteDialogOpen,
    setDeleteDialogOpen,
    solutionToDelete,
    setSolutionToDelete,
    handleDeleteConfirm
  } = useSolutionsAdmin();

  return (
    <div className="space-y-6">
      <SolutionsHeader />
      
      <div className="border rounded-lg border-neutral-700 bg-[#151823] overflow-hidden">
        {loading ? (
          <div className="text-center py-10">
            <p className="text-neutral-300">Carregando soluções...</p>
          </div>
        ) : solutions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-neutral-300">Nenhuma solução encontrada.</p>
            <p className="text-neutral-300 mt-2">Crie uma nova solução para começar.</p>
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
      </div>

      <DeleteSolutionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default AdminSolutions;

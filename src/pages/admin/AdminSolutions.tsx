
import React from 'react';
import { useSolutionsAdmin } from '@/hooks/admin/useSolutionsAdmin';
import { SolutionsHeader } from '@/components/admin/solutions/SolutionsHeader';
import { SolutionsTable } from '@/components/admin/solutions/SolutionsTable';
import { DeleteSolutionDialog } from '@/components/admin/solutions/DeleteSolutionDialog';
import { getCategoryDetails } from '@/lib/types/categoryTypes';

const AdminSolutions = () => {
  const {
    solutions,
    loading,
    deleteDialogOpen,
    setDeleteDialogOpen,
    solutionToDelete,
    setSolutionToDelete,
    handleDeleteConfirm,
    handleEdit,
    handleDelete,
    handleTogglePublish,
    handleCreateNew,
    totalSolutions,
    publishedSolutions
  } = useSolutionsAdmin();

  return (
    <div className="space-y-6">
      <SolutionsHeader 
        totalSolutions={totalSolutions}
        publishedSolutions={publishedSolutions}
        onCreateNew={handleCreateNew}
      />
      
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
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTogglePublish={handleTogglePublish}
              getCategoryDetails={getCategoryDetails}
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

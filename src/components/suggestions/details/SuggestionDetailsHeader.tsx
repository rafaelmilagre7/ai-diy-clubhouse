
import React from 'react';
import SuggestionHeader from '../SuggestionHeader';
import { AdminActions } from './AdminActions';

interface SuggestionDetailsHeaderProps {
  isAdmin: boolean;
  adminActionLoading: boolean;
  suggestionStatus: string;
  onUpdateStatus: (status: string) => void;
  onOpenDeleteDialog: () => void;
}

export const SuggestionDetailsHeader = ({
  isAdmin,
  adminActionLoading,
  suggestionStatus,
  onUpdateStatus,
  onOpenDeleteDialog
}: SuggestionDetailsHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <SuggestionHeader />
      
      {isAdmin && (
        <AdminActions
          adminActionLoading={adminActionLoading}
          suggestionStatus={suggestionStatus}
          onUpdateStatus={onUpdateStatus}
          onOpenDeleteDialog={onOpenDeleteDialog}
        />
      )}
    </div>
  );
};

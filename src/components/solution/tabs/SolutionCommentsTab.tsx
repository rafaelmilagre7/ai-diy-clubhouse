
import React from 'react';
import { Solution } from '@/types/solution';
import { CommentsSection } from '@/components/tools/comments/CommentsSection';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare } from 'lucide-react';

interface SolutionCommentsTabProps {
  solution: Solution;
}

export const SolutionCommentsTab: React.FC<SolutionCommentsTabProps> = ({ solution }) => {
  const commentsEnabled = true; // Você pode adicionar uma verificação aqui se necessário

  return (
    <div className="space-y-6">
      {commentsEnabled ? (
        <CommentsSection toolId={solution.id} />
      ) : (
        <Alert>
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          <AlertDescription>
            Os comentários ainda não estão disponíveis para esta solução.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SolutionCommentsTab;

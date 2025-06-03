
import React from "react";
import PublishSolutionForm from "@/components/admin/solution/form/PublishSolutionForm";
import { Solution } from "@/lib/supabase";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";

interface PublishTabProps {
  solutionId: string | null;
  solution: Solution | null;
  onSave: (values: SolutionFormValues) => Promise<void>;
  saving: boolean;
}

const PublishTab: React.FC<PublishTabProps> = ({
  solutionId,
  solution,
  onSave,
  saving,
}) => {
  return (
    <PublishSolutionForm 
      solutionId={solutionId} 
      solution={solution}
      onSave={onSave} 
      saving={saving} 
    />
  );
};

export default PublishTab;


import React from "react";
import { Solution } from "@/types/supabaseTypes";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";
import { PublishSolutionForm } from "@/components/admin/solution/form/PublishSolutionForm";

interface PublishFormProps {
  solution: Solution;
  onSave: (values: SolutionFormValues) => Promise<void>;
  saving: boolean;
}

const PublishForm: React.FC<PublishFormProps> = ({ solution, onSave, saving }) => {
  return (
    <PublishSolutionForm
      solution={solution}
      onSave={onSave}
      saving={saving}
    />
  );
};

export default PublishForm;

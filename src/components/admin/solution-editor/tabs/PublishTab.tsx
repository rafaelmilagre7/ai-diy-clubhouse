
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import PublishForm from "@/components/admin/solution/PublishForm";
import { Solution } from "@/types/supabaseTypes";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";

interface PublishTabProps {
  solutionId: string;
  solution: Solution;
  onSave: (values: SolutionFormValues) => Promise<void>;
  saving: boolean;
}

const PublishTab: React.FC<PublishTabProps> = ({ 
  solutionId, 
  solution, 
  onSave, 
  saving 
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <PublishForm 
          solution={solution}
          onSave={onSave}
          saving={saving}
        />
      </CardContent>
    </Card>
  );
};

export default PublishTab;

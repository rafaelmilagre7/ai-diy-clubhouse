
import React from "react";
import BasicInfoForm from "@/components/admin/solution/form/BasicInfoForm";
import { Card, CardContent } from "@/components/ui/card";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";

interface BasicInfoTabProps {
  solution: any;
  currentValues: SolutionFormValues;
  onSubmit: (values: SolutionFormValues) => Promise<void>;
  saving: boolean;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  solution,
  currentValues,
  onSubmit,
  saving
}) => {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6">
        <BasicInfoForm
          defaultValues={currentValues}
          onSubmit={onSubmit}
          saving={saving}
        />
      </CardContent>
    </Card>
  );
};

export default BasicInfoTab;

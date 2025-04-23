
import React from "react";
import BasicInfoForm from "@/components/admin/solution/BasicInfoForm";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";

interface BasicInfoTabProps {
  defaultValues: SolutionFormValues;
  onSubmit: (values: SolutionFormValues) => Promise<void>;
  saving: boolean;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  defaultValues,
  onSubmit,
  saving,
}) => {
  return (
    <BasicInfoForm 
      defaultValues={defaultValues} 
      onSubmit={onSubmit} 
      saving={saving} 
    />
  );
};

export default BasicInfoTab;

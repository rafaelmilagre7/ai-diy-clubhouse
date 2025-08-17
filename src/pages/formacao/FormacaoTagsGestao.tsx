import React from "react";
import FormacaoLayout from "@/components/layout/formacao/FormacaoLayout";
import { TagManagement } from "@/components/formacao/aulas/components/TagManagement";

const FormacaoTagsGestao = () => {
  return (
    <FormacaoLayout>
      <div className="max-w-6xl mx-auto p-6">
        <TagManagement />
      </div>
    </FormacaoLayout>
  );
};

export default FormacaoTagsGestao;
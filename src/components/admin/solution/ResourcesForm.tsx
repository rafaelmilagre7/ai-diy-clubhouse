
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ResourcesUploadForm from './form/ResourcesUploadForm';

interface ResourcesFormProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
}

const ResourcesForm = ({ solutionId, onSave, saving }: ResourcesFormProps) => {
  return (
    <div className="space-y-6">
      <Card className="border border-[#0ABAB5]/20">
        <CardHeader>
          <CardTitle>Materiais de Apoio</CardTitle>
          <CardDescription>
            Adicione documentos, templates e recursos que ajudarão o usuário a implementar a solução.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResourcesUploadForm
            solutionId={solutionId}
            onSave={onSave}
            saving={saving}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourcesForm;

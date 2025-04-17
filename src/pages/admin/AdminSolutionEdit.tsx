
import React from 'react';
import { useParams } from 'react-router-dom';

const AdminSolutionEdit = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Editar Solução</h1>
        <p className="text-muted-foreground">
          Edite os detalhes da solução e seus módulos.
        </p>
      </div>
      
      <div className="border p-6 rounded-lg">
        <p>ID da Solução: {id}</p>
        {/* Formulário de edição será implementado aqui */}
      </div>
    </div>
  );
};

export default AdminSolutionEdit;

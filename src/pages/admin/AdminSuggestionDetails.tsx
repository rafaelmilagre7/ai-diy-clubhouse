
import React from 'react';
import { useParams } from 'react-router-dom';

const AdminSuggestionDetails = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1 className="text-2xl font-bold">Detalhes da Sugestão</h1>
      <p className="text-muted-foreground mt-2">
        Visualizando detalhes da sugestão ID: {id}
      </p>
    </div>
  );
};

export default AdminSuggestionDetails;

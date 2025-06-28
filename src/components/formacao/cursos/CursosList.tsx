
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Curso {
  id: string;
  title: string;
  description: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  cover_image_url: string;
  instructor_id: string;
  category: string;
  difficulty_level: string;
  estimated_hours: number;
}

interface CursosListProps {
  cursos: Curso[];
  loading: boolean;
  onEdit: (curso: Curso) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

const CursosList: React.FC<CursosListProps> = ({ 
  cursos, 
  loading, 
  onEdit, 
  onDelete, 
  isAdmin 
}) => {
  if (loading) {
    return <div>Carregando cursos...</div>;
  }

  if (cursos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhum curso encontrado</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Não há cursos cadastrados no momento.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {cursos.map((curso) => (
        <Card key={curso.id}>
          <CardHeader>
            <CardTitle>{curso.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{curso.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CursosList;

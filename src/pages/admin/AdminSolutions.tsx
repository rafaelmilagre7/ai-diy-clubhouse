
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const AdminSolutions = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Soluções</h1>
          <p className="text-muted-foreground">
            Gerencie todas as soluções disponíveis na plataforma.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/solutions/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova Solução
          </Link>
        </Button>
      </div>
      
      <div className="border p-6 rounded-lg">
        <div className="text-center py-10">
          <p className="text-muted-foreground">Carregando soluções...</p>
          {/* Lista de soluções será implementada aqui */}
        </div>
      </div>
    </div>
  );
};

export default AdminSolutions;

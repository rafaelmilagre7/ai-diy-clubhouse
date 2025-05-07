
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const FormacaoAulasPage = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Aulas</h1>
        <Button asChild className="mt-4 md:mt-0">
          <Link to="/formacao/aulas/nova">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Aula
          </Link>
        </Button>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar aula..."
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Nenhuma aula encontrada.</p>
          <p className="text-muted-foreground mt-1">Comece criando sua primeira aula!</p>
          <Button asChild className="mt-4">
            <Link to="/formacao/aulas/nova">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Aula
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormacaoAulasPage;

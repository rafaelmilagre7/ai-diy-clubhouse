
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle, VideoIcon, BookOpen, Users } from "lucide-react";

const FormacaoHomePage = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Painel de Formação</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center">
              <VideoIcon className="mr-2 h-5 w-5" />
              Aulas
            </CardTitle>
            <CardDescription>Gerencie as aulas disponíveis na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Button asChild>
                <Link to="/formacao/aulas">
                  Ver todas as aulas
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/formacao/aulas/nova">
                  <PlusCircle className="mr-2 h-4 w-4" /> Nova Aula
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Cursos
            </CardTitle>
            <CardDescription>Gerencie os cursos da plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Button asChild>
                <Link to="/formacao/cursos">
                  Ver todos os cursos
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/formacao/cursos/novo">
                  <PlusCircle className="mr-2 h-4 w-4" /> Novo Curso
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Alunos
            </CardTitle>
            <CardDescription>Gerencie os alunos da plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Button asChild>
                <Link to="/formacao/alunos">
                  Ver todos os alunos
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FormacaoHomePage;

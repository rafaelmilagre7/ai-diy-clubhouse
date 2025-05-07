
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Clock, BookOpen } from "lucide-react";

const MemberCursosPage = () => {
  // Simular dados de cursos (em um projeto real, viria de uma API)
  const cursos = [
    {
      id: '1',
      titulo: 'Introdução à IA na Indústria',
      descricao: 'Aprenda os fundamentos da IA e como aplicá-la em ambientes industriais.',
      imagem: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
      progresso: 45,
      totalAulas: 8,
      aulasAssistidas: 3
    },
    {
      id: '2',
      titulo: 'IA para Marketing Digital',
      descricao: 'Domine as principais ferramentas de IA para otimização de marketing.',
      imagem: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&auto=format&fit=crop',
      progresso: 0,
      totalAulas: 6,
      aulasAssistidas: 0
    }
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Meus Cursos</h1>
      
      {cursos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cursos.map((curso) => (
            <Card key={curso.id} className="overflow-hidden flex flex-col">
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={curso.imagem} 
                  alt={curso.titulo} 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>{curso.titulo}</CardTitle>
                <CardDescription>{curso.descricao}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 flex-grow">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Progresso:
                  </span>
                  <span className="text-sm font-medium">
                    {curso.aulasAssistidas}/{curso.totalAulas} aulas
                  </span>
                </div>
                <Progress value={curso.progresso} className="h-2" />
                
                <div className="flex items-center text-sm text-muted-foreground mt-4">
                  <BookOpen className="h-4 w-4 mr-1" />
                  <span>{curso.totalAulas} aulas</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to={`/membro/curso/${curso.id}`}>
                    {curso.progresso > 0 ? 'Continuar curso' : 'Começar curso'}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-card border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">Nenhum curso disponível no momento.</p>
          <p className="text-muted-foreground mt-1">Em breve, novos cursos serão adicionados!</p>
        </div>
      )}
    </div>
  );
};

export default MemberCursosPage;

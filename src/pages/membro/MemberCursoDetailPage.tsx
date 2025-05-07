
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, PlayCircle, Lock } from "lucide-react";

const MemberCursoDetailPage = () => {
  const { cursoId } = useParams<{ cursoId: string }>();
  
  // Dados simulados (em um projeto real, viriam da API)
  const curso = {
    id: cursoId,
    titulo: 'Introdução à IA na Indústria',
    descricao: 'Aprenda os fundamentos da IA e como aplicá-la em ambientes industriais.',
    imagem: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
    duracao: '2h 30min',
    aulas: [
      {
        id: '1',
        titulo: 'Fundamentos de IA',
        duracao: '15 min',
        concluida: true,
        disponivel: true
      },
      {
        id: '2',
        titulo: 'Machine Learning na Prática',
        duracao: '22 min',
        concluida: true,
        disponivel: true
      },
      {
        id: '3',
        titulo: 'Aplicações na Indústria',
        duracao: '18 min',
        concluida: false,
        disponivel: true
      },
      {
        id: '4',
        titulo: 'Implementação de Projetos',
        duracao: '25 min',
        concluida: false,
        disponivel: true
      },
      {
        id: '5',
        titulo: 'Estudos de Caso',
        duracao: '30 min',
        concluida: false,
        disponivel: false
      }
    ]
  };

  if (!curso) {
    return <div className="container mx-auto py-8">Curso não encontrado</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar com informações do curso */}
        <div className="md:w-1/3 lg:w-1/4 mb-6 md:mb-0 md:pr-6">
          <div className="sticky top-6">
            <div className="aspect-video w-full overflow-hidden rounded-lg mb-4">
              <img 
                src={curso.imagem} 
                alt={curso.titulo} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <h1 className="text-2xl font-bold mb-2">{curso.titulo}</h1>
            <p className="text-muted-foreground mb-4">{curso.descricao}</p>
            
            <div className="flex items-center text-sm text-muted-foreground mb-6">
              <Clock className="h-4 w-4 mr-1" />
              <span>Duração total: {curso.duracao}</span>
            </div>
            
            <div>
              <Button asChild className="w-full">
                <Link to={`/membro/aula/${curso.aulas[0].id}`}>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  {curso.aulas.some(aula => aula.concluida) 
                    ? 'Continuar curso' 
                    : 'Começar curso'}
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Lista de aulas */}
        <div className="md:w-2/3 lg:w-3/4">
          <h2 className="text-xl font-bold mb-4">Conteúdo do curso</h2>
          
          <div className="space-y-3">
            {curso.aulas.map((aula) => (
              <Card key={aula.id} className={`border ${!aula.disponivel ? 'opacity-70' : ''}`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    {aula.concluida ? (
                      <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
                    ) : aula.disponivel ? (
                      <PlayCircle className="h-5 w-5 mr-3" />
                    ) : (
                      <Lock className="h-5 w-5 mr-3" />
                    )}
                    <div>
                      <h3 className="font-medium">{aula.titulo}</h3>
                      <p className="text-sm text-muted-foreground">{aula.duracao}</p>
                    </div>
                  </div>
                  
                  {aula.disponivel && (
                    <Button asChild variant={aula.concluida ? "outline" : "default"} size="sm">
                      <Link to={`/membro/aula/${aula.id}`}>
                        {aula.concluida ? 'Rever aula' : 'Assistir agora'}
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberCursoDetailPage;

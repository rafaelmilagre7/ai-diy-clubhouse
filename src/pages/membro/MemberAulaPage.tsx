
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Download, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MemberAulaPage = () => {
  const { aulaId } = useParams<{ aulaId: string }>();
  
  // Dados simulados (em um projeto real, viriam da API)
  const aula = {
    id: aulaId,
    titulo: 'Aplicações na Indústria',
    descricao: 'Nesta aula, exploraremos as diversas aplicações de IA em ambientes industriais.',
    videoId: '12345', // ID do vídeo no Panda Video
    materiais: [
      { id: '1', nome: 'Slides da apresentação', tipo: 'pdf' },
      { id: '2', nome: 'Código de exemplo', tipo: 'zip' }
    ],
    concluida: false,
    cursoId: '1'
  };
  
  const proximaAula = {
    id: '4',
    titulo: 'Implementação de Projetos'
  };

  if (!aula) {
    return <div className="container mx-auto py-8">Aula não encontrada</div>;
  }

  const marcarComoConcluida = () => {
    // Aqui iria a lógica para marcar como concluída
    console.log("Aula marcada como concluída");
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link 
          to={`/membro/curso/${aula.cursoId}`}
          className="inline-flex items-center text-primary hover:underline"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar para o curso
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-2">{aula.titulo}</h1>
      <p className="text-muted-foreground mb-6">{aula.descricao}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Player de vídeo */}
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
            <div className="text-white">
              [Player de Vídeo do Panda Video] <br />
              ID do vídeo: {aula.videoId}
            </div>
          </div>
          
          {/* Botões de navegação */}
          <div className="flex justify-between">
            <div>
              {!aula.concluida && (
                <Button onClick={marcarComoConcluida}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Marcar como concluída
                </Button>
              )}
            </div>
            <div>
              {proximaAula && (
                <Button asChild>
                  <Link to={`/membro/aula/${proximaAula.id}`}>
                    Próxima aula <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Status da aula */}
          <div className="flex justify-center">
            {aula.concluida ? (
              <Badge variant="success" className="px-3 py-1 text-sm">
                <CheckCircle className="mr-1 h-4 w-4" /> Aula concluída
              </Badge>
            ) : (
              <Badge variant="outline" className="px-3 py-1 text-sm">
                Em progresso
              </Badge>
            )}
          </div>
          
          {/* Materiais complementares */}
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold mb-3">Materiais complementares</h3>
              
              {aula.materiais.length > 0 ? (
                <div className="space-y-2">
                  {aula.materiais.map((material) => (
                    <div key={material.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span>{material.nome}</span>
                        <Badge variant="outline" className="ml-2">
                          {material.tipo}
                        </Badge>
                      </div>
                      <Button size="icon" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum material disponível para esta aula.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MemberAulaPage;

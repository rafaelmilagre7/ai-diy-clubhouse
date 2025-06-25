
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, Users, Play, Eye } from 'lucide-react';

const FormacaoCursos = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Cursos</h1>
          <p className="text-muted-foreground">
            Crie e gerencie cursos da plataforma de aprendizagem
          </p>
        </div>
        
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Curso
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 novos este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos Ativos</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9</div>
            <p className="text-xs text-muted-foreground">
              75% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <p className="text-xs text-muted-foreground">
              +18% desde último mês
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Cursos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold">Fundamentos de Inteligência Artificial</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Curso introdutório sobre conceitos básicos de IA e suas aplicações
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Play className="h-3 w-3" />
                      12 aulas
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      67 alunos
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      Publicado
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    Ver
                  </Button>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold">Marketing Digital Avançado</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Estratégias avançadas de marketing digital e automação
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Play className="h-3 w-3" />
                      8 aulas
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      54 alunos
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      Publicado
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    Ver
                  </Button>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold">Python para Iniciantes</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Aprenda programação Python do zero
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Play className="h-3 w-3" />
                      15 aulas
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      89 alunos
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      Rascunho
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    Publicar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormacaoCursos;

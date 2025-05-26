
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  Filter,
  Grid3X3,
  List
} from 'lucide-react';

const LearningPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const courses = [
    {
      id: "1",
      title: "Fundamentos de IA para Negócios",
      description: "Aprenda os conceitos básicos de IA e como aplicar em seu negócio. Este curso abrange desde os fundamentos teóricos até aplicações práticas.",
      thumbnail: "🤖",
      duration: "4h 30min",
      lessons: 12,
      level: "Básico",
      category: "Fundamentos",
      rating: 4.8,
      students: 1234,
      price: "Incluído",
      tags: ["IA", "Negócios", "Estratégia"]
    },
    {
      id: "2",
      title: "ChatGPT para Empresas",
      description: "Domine o uso do ChatGPT para automatizar processos empresariais e aumentar a produtividade.",
      thumbnail: "💬",
      duration: "6h 15min",
      lessons: 15,
      level: "Básico",
      category: "Ferramentas",
      rating: 4.9,
      students: 2156,
      price: "Incluído",
      tags: ["ChatGPT", "Automação", "Produtividade"]
    },
    {
      id: "3",
      title: "Automação com IA",
      description: "Automatize tarefas repetitivas usando ferramentas de IA e aumente a eficiência da sua empresa.",
      thumbnail: "⚡",
      duration: "8h 20min",
      lessons: 18,
      level: "Intermediário",
      category: "Automação",
      rating: 4.7,
      students: 856,
      price: "Incluído",
      tags: ["Automação", "Workflows", "Eficiência"]
    },
    {
      id: "4",
      title: "IA para Marketing Digital",
      description: "Use IA para criar campanhas de marketing mais eficazes e personalizar a experiência do cliente.",
      thumbnail: "📈",
      duration: "5h 40min",
      lessons: 10,
      level: "Básico",
      category: "Marketing",
      rating: 4.6,
      students: 1567,
      price: "Incluído",
      tags: ["Marketing", "Personalização", "Campanhas"]
    },
    {
      id: "5",
      title: "Análise de Dados com IA",
      description: "Aprenda a extrair insights valiosos dos seus dados usando ferramentas de IA e machine learning.",
      thumbnail: "📊",
      duration: "7h 10min",
      lessons: 14,
      level: "Intermediário",
      category: "Análise",
      rating: 4.8,
      students: 723,
      price: "Incluído",
      tags: ["Dados", "Analytics", "Insights"]
    },
    {
      id: "6",
      title: "IA Generativa para Criação de Conteúdo",
      description: "Explore ferramentas de IA generativa para criar conteúdo visual, textual e multimedia.",
      thumbnail: "🎨",
      duration: "6h 30min",
      lessons: 16,
      level: "Intermediário",
      category: "Criação",
      rating: 4.7,
      students: 945,
      price: "Incluído",
      tags: ["Criação", "Conteúdo", "Design"]
    }
  ];

  const categories = ["Todos", "Fundamentos", "Ferramentas", "Automação", "Marketing", "Análise", "Criação"];
  const levels = ["Todos", "Básico", "Intermediário", "Avançado"];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "Todos" || course.category === selectedCategory;
    const matchesLevel = !selectedLevel || selectedLevel === "Todos" || course.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const CourseCard = ({ course, isListView = false }: { course: any, isListView?: boolean }) => (
    <Card className={`hover:shadow-lg transition-shadow ${isListView ? 'flex' : ''}`}>
      <CardContent className={`p-6 ${isListView ? 'flex gap-6 items-center' : ''}`}>
        <div className={`${isListView ? 'flex-shrink-0' : 'mb-4'}`}>
          <div className="text-6xl text-center">{course.thumbnail}</div>
        </div>
        
        <div className={`${isListView ? 'flex-1' : ''}`}>
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg">{course.title}</h3>
            <Badge variant="outline">{course.level}</Badge>
          </div>
          
          <p className={`text-muted-foreground mb-4 ${isListView ? 'text-sm' : ''}`}>
            {course.description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {course.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className={`flex items-center gap-4 text-sm text-muted-foreground mb-4 ${isListView ? 'flex-wrap' : ''}`}>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {course.duration}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {course.lessons} aulas
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {course.students.toLocaleString()} alunos
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              {course.rating}
            </span>
          </div>
          
          <div className={`flex items-center justify-between ${isListView ? 'mt-4' : ''}`}>
            <span className="font-semibold text-green-600">{course.price}</span>
            <Button asChild>
              <Link to={`/learning/curso/${course.id}`}>Acessar Curso</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Catálogo de Cursos</h1>
        <p className="text-muted-foreground">
          Explore nossa biblioteca completa de cursos sobre IA e tecnologia
        </p>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cursos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Nível" />
            </SelectTrigger>
            <SelectContent>
              {levels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="mb-4">
        <p className="text-muted-foreground">
          {filteredCourses.length} curso{filteredCourses.length !== 1 ? 's' : ''} encontrado{filteredCourses.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Lista de Cursos */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} course={course} isListView={viewMode === 'list'} />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum curso encontrado</h3>
          <p className="text-muted-foreground mb-4">
            Tente ajustar os filtros ou buscar por outros termos
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('');
              setSelectedLevel('');
            }}
          >
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
};

export default LearningPage;

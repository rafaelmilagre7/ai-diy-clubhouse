
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Play, 
  Clock, 
  Target, 
  ChevronRight,
  TrendingUp 
} from "lucide-react";
import LoadingScreen from "@/components/common/LoadingScreen";
import { PageTransition } from "@/components/transitions/PageTransition";

const Solutions = () => {
  const { solutions, loading, error } = useSolutionsData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Filter and search solutions
  const filteredSolutions = useMemo(() => {
    if (!solutions) return [];
    
    return solutions.filter(solution => {
      const matchesSearch = solution.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           solution.overview?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || solution.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [solutions, searchTerm, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    if (!solutions) return [];
    return [...new Set(solutions.map(s => s.category))].filter(Boolean);
  }, [solutions]);

  if (loading) {
    return <LoadingScreen message="Carregando soluções..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">Erro ao carregar soluções</h2>
          <p className="text-neutral-600">Tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-neutral-200 p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                    Soluções de IA
                  </h1>
                  <p className="text-neutral-600">
                    Descubra e implemente soluções práticas de inteligência artificial
                  </p>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-neutral-600">
                  <TrendingUp className="w-5 h-5 text-viverblue" />
                  <span>{solutions?.length || 0} soluções disponíveis</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-neutral-200 p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      placeholder="Buscar soluções..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    onClick={() => setSelectedCategory("all")}
                    size="sm"
                    className={selectedCategory === "all" ? "bg-viverblue hover:bg-viverblue-dark" : ""}
                  >
                    Todas
                  </Button>
                   {categories.map((category) => (
                    <Button
                      key={category as string}
                      variant={selectedCategory === category ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category as string)}
                      size="sm"
                      className={selectedCategory === category ? "bg-viverblue hover:bg-viverblue-dark" : ""}
                    >
                      {category as string}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Solutions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSolutions.map((solution) => (
              <Card 
                key={solution.id} 
                className="bg-white/95 backdrop-blur-sm border-neutral-200 hover:shadow-lg transition-all duration-300 group"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-neutral-800 group-hover:text-viverblue transition-colors">
                        {solution.title}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="secondary" className="bg-viverblue/10 text-viverblue border-viverblue/20">
                          {solution.category}
                        </Badge>
                        <Badge variant="outline" className="border-neutral-300">
                          {solution.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {solution.overview && (
                    <p className="text-neutral-600 text-sm leading-relaxed line-clamp-3">
                      {solution.overview}
                    </p>
                  )}
                  
                  {solution.estimated_time && (
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      <Clock className="w-4 h-4" />
                      Tempo estimado: {solution.estimated_time}
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Link to={`/solution/${solution.id}`} className="flex-1">
                      <Button 
                        variant="outline" 
                        className="w-full text-viverblue border-viverblue hover:bg-viverblue/5"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </Link>
                    
                    <Link to={`/implement/${solution.id}`}>
                      <Button 
                        className="bg-viverblue hover:bg-viverblue-dark text-white"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Implementar
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredSolutions.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-medium text-neutral-800 mb-2">
                Nenhuma solução encontrada
              </h3>
              <p className="text-neutral-600">
                Tente ajustar os filtros ou termos de busca
              </p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Solutions;

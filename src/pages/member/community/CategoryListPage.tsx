
import React from "react";
import { CategoryList } from "@/components/community/CategoryList";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CategoryListPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Aurora Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-secondary/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/comunidade')}
            className="mb-4 hover:bg-primary/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Comunidade
          </Button>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm border border-white/10 mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-2">
              Categorias da Comunidade
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore diferentes tópicos e encontre discussões do seu interesse
            </p>
          </div>
        </div>

        {/* Categories List */}
        <div className="max-w-4xl mx-auto">
          <CategoryList />
        </div>
      </div>
    </div>
  );
};

export default CategoryListPage;

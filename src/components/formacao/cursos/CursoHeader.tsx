
import { LearningCourse } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Edit, Calendar, Clock, FileText, BarChart, Users, BookOpen, Star } from "lucide-react";
import { NovaAulaButton } from "@/components/formacao/aulas/NovaAulaButton";

interface CursoHeaderProps {
  curso: LearningCourse;
  onNovoModulo: () => void;
  onEditarCurso: () => void;
  isAdmin: boolean;
}

export const CursoHeader: React.FC<CursoHeaderProps> = ({
  curso,
  onNovoModulo,
  onEditarCurso,
  isAdmin
}) => {
  const coverImage = curso.cover_image_url || '/placeholder-course.jpg';
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section com Aurora Background */}
      <div className="relative">
        {/* Aurora Background Blobs */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-aurora/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-revenue/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-operational/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Main Hero Card */}
        <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden glass border border-white/10 shadow-2xl">
          <div 
            className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-700 hover:scale-110" 
            style={{ backgroundImage: `url(${coverImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-aurora/60 via-transparent to-revenue/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>
          
          {/* Floating Particles */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-2 h-2 bg-white/30 rounded-full animate-float"></div>
            <div className="absolute top-40 right-20 w-1 h-1 bg-aurora/50 rounded-full animate-float animation-delay-2000"></div>
            <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-revenue/40 rounded-full animate-float animation-delay-4000"></div>
          </div>
          
          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <BookOpen className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  Formação Avançada
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent leading-tight">
                {curso.title}
              </h1>
              
              <p className="text-lg text-white/90 line-clamp-2 max-w-3xl leading-relaxed">
                {curso.description}
              </p>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-6 pt-2">
                <div className="flex items-center gap-2 text-white/80">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {new Date(curso.created_at).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Acesso completo</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm">Conteúdo premium</span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          {isAdmin && (
            <div className="absolute top-6 right-6">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={onEditarCurso}
                className="bg-white/20 backdrop-blur-md border-white/20 text-white hover:bg-white/30 transition-all duration-300"
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar Curso
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modules Section Header */}
      <div className="relative">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-aurora to-revenue rounded-full"></div>
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">
                Módulos do Curso
              </h2>
            </div>
            <p className="text-text-secondary text-lg leading-relaxed max-w-2xl">
              Explore os módulos deste curso e acesse as aulas disponíveis. Cada módulo foi cuidadosamente 
              estruturado para maximizar seu aprendizado.
            </p>
          </div>
          
          {isAdmin && (
            <div className="flex gap-3">
              <Button 
                onClick={onNovoModulo}
                className="bg-gradient-to-r from-aurora to-revenue hover:from-aurora-dark hover:to-revenue-dark 
                          shadow-lg hover:shadow-xl transition-all duration-300 group"
                size="lg"
              >
                <FileText className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Novo Módulo
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

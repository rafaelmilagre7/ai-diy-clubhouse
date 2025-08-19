import React, { useMemo } from "react";
import { UnifiedCertificateCard } from "./UnifiedCertificateCard";
import { useUnifiedCertificates } from "@/hooks/learning/useUnifiedCertificates";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Award, BookOpen, TrendingUp, Sparkles, Zap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface UnifiedCertificatesListProps {
  courseId?: string;
  searchTerm?: string;
  selectedCategory?: string;
  sortBy?: string;
}

export const UnifiedCertificatesList = ({ 
  courseId, 
  searchTerm = "", 
  selectedCategory = "all", 
  sortBy = "recent" 
}: UnifiedCertificatesListProps) => {
  const { 
    certificates, 
    isLoading, 
    error, 
    downloadCertificate,
    generatePendingCertificates,
    isGeneratingPending
  } = useUnifiedCertificates(courseId);
  
  const handleDownload = (certificateId: string) => {
    downloadCertificate(certificateId);
  };

  const handleGeneratePending = () => {
    generatePendingCertificates();
  };

  // Filtrar e ordenar certificados
  const filteredAndSortedCertificates = useMemo(() => {
    let filtered = certificates.filter(cert => {
      const matchesSearch = !searchTerm || cert.title?.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesCategory = true;
      if (selectedCategory !== "all") {
        if (selectedCategory === "courses") {
          matchesCategory = cert.type === 'course';
        } else if (selectedCategory === "solutions") {
          matchesCategory = cert.type === 'solution';
        }
      }
      
      return matchesSearch && matchesCategory;
    });

    // Ordenação
    const sortFunction = (a: any, b: any) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.issued_at).getTime() - new Date(b.issued_at).getTime();
        case "name":
          const nameA = (a.title || "").toLowerCase();
          const nameB = (b.title || "").toLowerCase();
          return nameA.localeCompare(nameB);
        case "name-desc":
          const nameDescA = (a.title || "").toLowerCase();
          const nameDescB = (b.title || "").toLowerCase();
          return nameDescB.localeCompare(nameDescA);
        case "recent":
        default:
          return new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime();
      }
    };

    return filtered.sort(sortFunction);
  }, [certificates, searchTerm, selectedCategory, sortBy]);
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="space-y-4"
            >
              <Skeleton className="h-64 w-full rounded-2xl bg-muted/20" />
              <Skeleton className="h-6 w-3/4 bg-muted/20" />
              <Skeleton className="h-4 w-1/2 bg-muted/20" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24 bg-muted/20" />
                <Skeleton className="h-10 w-24 bg-muted/20" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar certificados</AlertTitle>
          <AlertDescription>
            Não foi possível carregar seus certificados. Tente recarregar a página.
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  if (filteredAndSortedCertificates.length === 0) {
    const hasNoCertificates = certificates.length === 0;
    const hasNoFilterResults = certificates.length > 0 && filteredAndSortedCertificates.length === 0;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center py-16 space-y-8"
      >
        <div className="flex justify-center">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 rounded-full p-8 backdrop-blur-sm border border-primary/20">
              <Award className="h-20 w-20 text-primary" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="h-8 w-8 text-yellow-400" />
            </motion.div>
          </motion.div>
        </div>
        
        <div className="space-y-4 max-w-2xl mx-auto">
          {hasNoCertificates ? (
            <>
              <h3 className="text-2xl font-bold text-foreground">
                Sua jornada de certificação começa aqui! 🚀
              </h3>
              <p className="text-lg text-muted-foreground">
                Complete cursos e implemente soluções para conquistar seus primeiros certificados
                e construir um portfólio sólido de competências.
              </p>
              
              <div className="flex justify-center mt-6">
                <Button
                  onClick={handleGeneratePending}
                  disabled={isGeneratingPending}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  {isGeneratingPending ? "Verificando..." : "Verificar Certificados Pendentes"}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 max-w-md mx-auto">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 rounded-xl bg-gradient-to-br from-yellow-400/10 to-amber-400/10 border border-yellow-400/20"
                >
                  <BookOpen className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-yellow-400">Cursos Disponíveis</p>
                  <p className="text-xs text-muted-foreground">Complete aulas e conquiste certificados</p>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 rounded-xl bg-gradient-to-br from-blue-400/10 to-purple-400/10 border border-blue-400/20"
                >
                  <TrendingUp className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-blue-400">Soluções Práticas</p>
                  <p className="text-xs text-muted-foreground">Implemente e certifique seu conhecimento</p>
                </motion.div>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-foreground">
                Nenhum certificado encontrado 🔍
              </h3>
              <p className="text-lg text-muted-foreground">
                Ajuste os filtros ou termos de busca para encontrar seus certificados.
              </p>
            </>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Resultados Header */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Exibindo <span className="font-semibold text-foreground">{filteredAndSortedCertificates.length}</span> certificado{filteredAndSortedCertificates.length !== 1 ? 's' : ''}
        </p>
        
        <Button
          onClick={handleGeneratePending}
          disabled={isGeneratingPending}
          variant="outline"
          className="border-primary/50 text-primary hover:bg-primary/10"
        >
          <Zap className="h-4 w-4 mr-2" />
          {isGeneratingPending ? "Verificando..." : "Verificar Pendentes"}
        </Button>
      </div>

      {/* Grid de Certificados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedCertificates.map((certificate, index) => (
          <motion.div
            key={certificate.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <UnifiedCertificateCard
              certificate={certificate}
              onDownload={handleDownload}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
import React, { useMemo } from "react";
import { UnifiedCertificateCard } from "./UnifiedCertificateCard";
import { useUnifiedCertificates } from "@/hooks/learning/useUnifiedCertificates";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Award, BookOpen, TrendingUp, Zap, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  
  const { 
    certificates, 
    isLoading, 
    error, 
    downloadCertificate,
    generatePendingCertificates,
    isGeneratingPending
  } = useUnifiedCertificates(courseId);
  
  const handleGeneratePending = () => {
    console.log('🎯 Iniciando geração de certificados pendentes...');
    console.log('👤 Usuário atual:', certificates[0]?.user_id || 'não identificado');
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
          </motion.div>
        </div>
        
        <div className="space-y-4 max-w-2xl mx-auto">
          {hasNoCertificates ? (
            <>
              <h3 className="text-2xl font-bold text-foreground">
                🎓 Você ainda não possui certificados
              </h3>
              
              <p className="text-lg text-muted-foreground">
                Para conquistar seu primeiro certificado, você precisa completar 100% das aulas de uma formação.
              </p>
              
              <div className="bg-card border border-border rounded-xl p-6 space-y-3 text-left">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-system-healthy" />
                  Como obter um certificado:
                </h4>
                
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✅</span>
                    <span>Complete todas as aulas publicadas de um curso</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✅</span>
                    <span>Chegue a 100% de progresso no curso</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✅</span>
                    <span>O certificado será gerado automaticamente</span>
                  </li>
                </ul>
              </div>
              
              <div className="pt-4">
                <Button
                  onClick={() => navigate('/learning')}
                  size="lg"
                  className="bg-gradient-to-r from-aurora-primary to-primary hover:from-aurora-primary/90 hover:to-primary/90 text-white font-bold px-10 py-4 rounded-2xl shadow-2xl hover:shadow-aurora-primary/25 transition-smooth transform hover:scale-105 group"
                >
                  <BookOpen className="h-6 w-6 mr-3 group-hover:animate-bounce" />
                  Ir para Formações
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mt-4">
                💡 A verificação de certificados acontece automaticamente sempre que você acessa esta página
              </p>
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
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleGeneratePending}
            disabled={isGeneratingPending}
            variant="outline"
            className="border-aurora/50 text-aurora hover:bg-aurora/10 hover:border-aurora transition-smooth font-medium shadow-sm hover:shadow-md group"
            title="Verifica se você tem direito a novos certificados baseado nos cursos e soluções que completou"
          >
            <Zap className="h-4 w-4 mr-2 group-hover:animate-pulse" />
            {isGeneratingPending ? "Verificando..." : "🔍 Buscar Novos Certificados"}
          </Button>
        </div>
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
              onDownload={downloadCertificate}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
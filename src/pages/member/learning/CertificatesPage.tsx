import React, { useState } from "react";
import { CertificatesFilters } from "@/components/learning/certificates/CertificatesFilters";
import { UnifiedCertificatesList } from "@/components/learning/certificates/UnifiedCertificatesList";
import { CertificateErrorBoundary } from "@/components/certificates/CertificateErrorBoundary";
import { CertificateTestPanel } from "@/components/certificates/CertificateTestPanel";
import { useAuth } from "@/contexts/auth";
import { Award } from "lucide-react";

const CertificatesPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  
  return (
    <div className="space-y-8">
      {/* Banner Hero no estilo das outras páginas */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-viverblue/5 to-secondary/5 border border-border backdrop-blur-sm">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-viverblue/3 to-secondary/3" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-viverblue/10 to-transparent rounded-full blur-2xl" />
        
        <div className="relative px-8 py-12">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-6 h-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-primary/20">
                    <div className="w-3 h-3 bg-primary/60 rounded-sm shadow-lg"></div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary/40 rounded-full blur-sm"></div>
                </div>
                <span className="text-sm font-medium text-primary uppercase tracking-wider">
                  Seus Certificados
                </span>
              </div>
              
              <div>
                <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-2">
                  Certificados
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  Visualize e gerencie seus certificados de conclusão das soluções implementadas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <CertificateErrorBoundary>
        <div className="space-y-8">
          {/* Painel de teste do novo design */}
          <CertificateTestPanel />
          
          <CertificatesFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
          
          <UnifiedCertificatesList 
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            sortBy={sortBy}
          />
        </div>
      </CertificateErrorBoundary>
    </div>
  );
};

export default CertificatesPage;
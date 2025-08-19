
import React, { useState } from "react";
import { CertificatesHeader } from "@/components/learning/certificates/CertificatesHeader";
import { CertificatesFilters } from "@/components/learning/certificates/CertificatesFilters";
import { UnifiedCertificatesList } from "@/components/learning/certificates/UnifiedCertificatesList";
import { CertificateErrorBoundary } from "@/components/certificates/CertificateErrorBoundary";
import { useAuth } from "@/contexts/auth";

const CertificatesPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  
  return (
    <div className="min-h-screen certificate-page">
      {/* Hero Banner VIA Aurora Style */}
      <div className="relative overflow-hidden certificate-hero certificate-aurora-hero">
        {/* Background Aurora - Garantido sem interferir com cliques */}
        <div className="absolute inset-0 certificate-bg-pattern certificate-aurora-hero"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent certificate-bg-pattern"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-aurora/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-primary/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-viverblue/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 pt-16 pb-24">
          <CertificateErrorBoundary>
            <CertificatesHeader />
          </CertificateErrorBoundary>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="relative bg-background certificate-content">
        <div className="container mx-auto px-4 py-12 space-y-8 max-w-7xl certificate-container">
          <CertificateErrorBoundary>
            <div className="space-y-8">
              <div className="certificate-filters">
                <CertificatesFilters
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                />
              </div>
              
              <div className="certificate-interactive">
                <UnifiedCertificatesList 
                  searchTerm={searchTerm}
                  selectedCategory={selectedCategory}
                  sortBy={sortBy}
                />
              </div>
            </div>
          </CertificateErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default CertificatesPage;

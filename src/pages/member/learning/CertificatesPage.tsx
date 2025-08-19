
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
    <div className="space-y-8">
      <CertificateErrorBoundary>
        <CertificatesHeader />
      </CertificateErrorBoundary>
      
      <CertificateErrorBoundary>
        <div className="space-y-8">
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

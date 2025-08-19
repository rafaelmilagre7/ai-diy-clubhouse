
import React, { useState } from "react";
import { CertificatesHeader } from "@/components/learning/certificates/CertificatesHeader";
import { CertificatesFilters } from "@/components/learning/certificates/CertificatesFilters";
import { UnifiedCertificatesList } from "@/components/learning/certificates/UnifiedCertificatesList";
import { useAuth } from "@/contexts/auth";

const MemberCertificates = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
          <CertificatesHeader />
          
          <div className="space-y-6">
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
        </div>
      </div>
    </div>
  );
};

export default MemberCertificates;

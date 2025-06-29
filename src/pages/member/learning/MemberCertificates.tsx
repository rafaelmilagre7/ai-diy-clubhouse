
import React, { useState } from "react";
import { CertificatesList } from "@/components/learning/certificates/CertificatesList";
import { CertificatesHeader } from "@/components/learning/certificates/CertificatesHeader";
import { CertificatesFilters } from "@/components/learning/certificates/CertificatesFilters";
import { useAuth } from "@/contexts/auth";

const MemberCertificates = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col gap-8">
        <CertificatesHeader />
        
        <CertificatesFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
        
        <CertificatesList 
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          sortBy={sortBy}
        />
      </div>
    </div>
  );
};

export default MemberCertificates;


import React from 'react';

interface SolutionSchemaProps {
  solution: {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    thumbnail_url?: string;
    estimated_time?: number;
    success_rate?: number;
    implementation_count?: number;
  };
}

export const SolutionAdvancedSchema: React.FC<SolutionSchemaProps> = ({ solution }) => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": ["HowTo", "Course"],
    "name": solution.title,
    "description": solution.description,
    "image": solution.thumbnail_url || `${window.location.origin}/og-image-viver-ia.jpg`,
    "url": `${window.location.origin}/solution/${solution.id}`,
    "datePublished": new Date().toISOString(),
    "dateModified": new Date().toISOString(),
    "author": {
      "@type": "Organization",
      "name": "VIVER DE IA Hub",
      "url": "https://app.viverdeia.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "VIVER DE IA Hub",
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/lovable-uploads/d847c892-aafa-4cc1-92c6-110aff1d9755.png`
      }
    },
    "mainEntity": {
      "@type": "Question",
      "name": `Como ${solution.title.toLowerCase()}?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": solution.description
      }
    },
    "educationalLevel": solution.difficulty === 'easy' ? 'Iniciante' : 
                       solution.difficulty === 'medium' ? 'Intermediário' : 'Avançado',
    "timeRequired": solution.estimated_time ? `PT${solution.estimated_time}M` : "PT30M",
    "aggregateRating": solution.success_rate ? {
      "@type": "AggregateRating",
      "ratingValue": Math.round((solution.success_rate / 100) * 5 * 10) / 10,
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": solution.implementation_count || 100
    } : undefined,
    "keywords": [
      solution.category.toLowerCase(),
      solution.difficulty,
      "IA",
      "implementação",
      "automação",
      "negócio"
    ].join(", ")
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};

interface ToolSchemaProps {
  tool: {
    id: string;
    name: string;
    description: string;
    category: string;
    official_url?: string;
    logo_url?: string;
    rating?: number;
    review_count?: number;
  };
}

export const ToolAdvancedSchema: React.FC<ToolSchemaProps> = ({ tool }) => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name,
    "description": tool.description,
    "url": tool.official_url || `${window.location.origin}/tool/${tool.id}`,
    "image": tool.logo_url || `${window.location.origin}/og-image-viver-ia.jpg`,
    "applicationCategory": `${tool.category} Software`,
    "operatingSystem": "Web-based",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "BRL",
      "availability": "https://schema.org/InStock"
    },
    "publisher": {
      "@type": "Organization",
      "name": "VIVER DE IA Hub"
    },
    "aggregateRating": tool.rating ? {
      "@type": "AggregateRating",
      "ratingValue": tool.rating,
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": tool.review_count || 50
    } : undefined,
    "keywords": [
      tool.category.toLowerCase(),
      "ferramenta IA",
      "automação",
      "produtividade",
      "negócio"
    ].join(", ")
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export const BreadcrumbSchema: React.FC<BreadcrumbSchemaProps> = ({ items }) => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};


import React from 'react';

interface OrganizationSchema {
  "@context": string;
  "@type": string;
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs: string[];
}

interface WebsiteSchema {
  "@context": string;
  "@type": string;
  name: string;
  url: string;
  potentialAction: {
    "@type": string;
    target: string;
    "query-input": string;
  };
}

export const OrganizationStructuredData: React.FC = () => {
  const organizationSchema: OrganizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "VIVER DE IA Hub",
    "url": "https://app.viverdeia.com",
    "logo": "https://app.viverdeia.com/logo-viver-ia.png",
    "description": "Plataforma completa para implementação de soluções de Inteligência Artificial em empresas",
    "sameAs": [
      "https://www.linkedin.com/company/viver-de-ia",
      "https://www.instagram.com/viverdeia",
      "https://www.youtube.com/@viverdeia"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
  );
};

export const WebsiteStructuredData: React.FC = () => {
  const websiteSchema: WebsiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "VIVER DE IA Hub",
    "url": "https://app.viverdeia.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://app.viverdeia.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
    />
  );
};

// Schema para soluções individuais
export const SolutionStructuredData: React.FC<{
  solution: {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    thumbnail_url?: string;
  }
}> = ({ solution }) => {
  const solutionSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": solution.title,
    "description": solution.description,
    "category": solution.category,
    "image": solution.thumbnail_url,
    "url": `https://app.viverdeia.com/solution/${solution.id}`,
    "provider": {
      "@type": "Organization",
      "name": "VIVER DE IA Hub"
    },
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Dificuldade",
        "value": solution.difficulty
      },
      {
        "@type": "PropertyValue", 
        "name": "Categoria",
        "value": solution.category
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(solutionSchema) }}
    />
  );
};

// Schema para cursos
export const CourseStructuredData: React.FC<{
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail_url?: string;
  }
}> = ({ course }) => {
  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description,
    "image": course.thumbnail_url,
    "url": `https://app.viverdeia.com/learning/course/${course.id}`,
    "provider": {
      "@type": "Organization",
      "name": "VIVER DE IA Hub"
    },
    "educationalLevel": "Intermediário",
    "teaches": "Implementação prática de Inteligência Artificial"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
    />
  );
};

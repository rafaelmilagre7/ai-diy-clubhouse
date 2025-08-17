
import React from 'react';
import { useOrganizationSchema } from '@/hooks/seo/useStructuredData';
import { usePreloadCriticalAssets } from '@/hooks/seo/usePreloadCriticalAssets';
// ❌ Hook CSP inseguro removido - SecurityProvider já cuida da CSP
// import { useSecurityHeaders } from '@/hooks/seo/useSecurityHeaders'; 
import { usePerformanceOptimization } from '@/hooks/seo/usePerformanceOptimization';
import { useInternalLinking } from '@/hooks/seo/useInternalLinking';
import { useAdvancedHeaders } from '@/hooks/seo/useAdvancedHeaders';
import { useURLRedirects } from '@/hooks/seo/useURLRedirects';

interface SEOWrapperProps {
  children: React.ReactNode;
}

export const SEOWrapper: React.FC<SEOWrapperProps> = ({ children }) => {
  // Fase 1: Structured data and basic SEO
  useOrganizationSchema();
  
  // Fase 2: Performance and security optimizations
  usePreloadCriticalAssets();
  // ❌ useSecurityHeaders(); // REMOVIDO - CSP vulnerável
  usePerformanceOptimization();
  useInternalLinking();
  
  // Fase 3: Advanced SEO features
  useAdvancedHeaders();
  useURLRedirects();
  
  return <>{children}</>;
};

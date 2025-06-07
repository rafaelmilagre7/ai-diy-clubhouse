
import React from 'react';
import { useOrganizationSchema } from '@/hooks/seo/useStructuredData';
import { usePreloadCriticalAssets } from '@/hooks/seo/usePreloadCriticalAssets';
import { useSecurityHeaders } from '@/hooks/seo/useSecurityHeaders';
import { usePerformanceOptimization } from '@/hooks/seo/usePerformanceOptimization';
import { useInternalLinking } from '@/hooks/seo/useInternalLinking';

interface SEOWrapperProps {
  children: React.ReactNode;
}

export const SEOWrapper: React.FC<SEOWrapperProps> = ({ children }) => {
  // Add organization schema to every page
  useOrganizationSchema();
  
  // Performance and security optimizations
  usePreloadCriticalAssets();
  useSecurityHeaders();
  usePerformanceOptimization();
  useInternalLinking();
  
  return <>{children}</>;
};


import React from 'react';
import { useOrganizationSchema } from '@/hooks/seo/useStructuredData';

interface SEOWrapperProps {
  children: React.ReactNode;
}

export const SEOWrapper: React.FC<SEOWrapperProps> = ({ children }) => {
  // Add organization schema to every page
  useOrganizationSchema();
  
  return <>{children}</>;
};

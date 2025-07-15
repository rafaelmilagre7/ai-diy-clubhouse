
import { useEffect } from 'react';
import { APP_CONFIG } from '@/config/app';

interface OrganizationSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs: string[];
}

interface CourseSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  provider: {
    '@type': string;
    name: string;
  };
  url: string;
}

interface ToolSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  applicationCategory: string;
  url: string;
}

export const useOrganizationSchema = () => {
  useEffect(() => {
    const schema: OrganizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Viver de IA Hub',
      url: APP_CONFIG.getAppDomain(),
      logo: `${APP_CONFIG.getAppDomain()}/favicon.ico`,
      description: 'Plataforma completa para transformar seu negócio com Inteligência Artificial',
      sameAs: []
    };

    const scriptId = 'organization-schema';
    
    // Remove existing schema if present
    const existing = document.getElementById(scriptId);
    if (existing) {
      existing.remove();
    }

    // Add new schema
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const element = document.getElementById(scriptId);
      if (element) {
        element.remove();
      }
    };
  }, []);
};

export const useCourseSchema = (course: { title: string; description?: string; slug: string }) => {
  useEffect(() => {
    if (!course.title) return;

    const schema: CourseSchema = {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: course.title,
      description: course.description || course.title,
      provider: {
        '@type': 'Organization',
        name: 'Viver de IA Hub'
      },
      url: `${APP_CONFIG.getAppDomain()}/learning/courses/${course.slug}`
    };

    const scriptId = 'course-schema';
    
    // Remove existing schema if present
    const existing = document.getElementById(scriptId);
    if (existing) {
      existing.remove();
    }

    // Add new schema
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const element = document.getElementById(scriptId);
      if (element) {
        element.remove();
      }
    };
  }, [course.title, course.description, course.slug]);
};

export const useToolSchema = (tool: { name: string; description: string; id: string }) => {
  useEffect(() => {
    if (!tool.name) return;

    const schema: ToolSchema = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: tool.name,
      description: tool.description,
      applicationCategory: 'Artificial Intelligence Tool',
      url: `${APP_CONFIG.getAppDomain()}/tools/${tool.id}`
    };

    const scriptId = 'tool-schema';
    
    // Remove existing schema if present
    const existing = document.getElementById(scriptId);
    if (existing) {
      existing.remove();
    }

    // Add new schema
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const element = document.getElementById(scriptId);
      if (element) {
        element.remove();
      }
    };
  }, [tool.name, tool.description, tool.id]);
};

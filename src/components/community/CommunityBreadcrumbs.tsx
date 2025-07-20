
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useCommunityCategories } from "@/hooks/community/useCommunityCategories";

interface CommunityBreadcrumbsProps {
  categorySlug?: string;
  topicTitle?: string;
}

export const CommunityBreadcrumbs = ({ categorySlug, topicTitle }: CommunityBreadcrumbsProps) => {
  const { categories } = useCommunityCategories();
  
  // Encontrar a categoria atual com base no slug
  const currentCategory = categorySlug 
    ? categories?.find(cat => cat.slug === categorySlug)
    : null;
  
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/comunidade">Comunidade</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {currentCategory && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {topicTitle ? (
                <BreadcrumbLink asChild>
                  <Link to={`/comunidade/categoria/${categorySlug}`}>
                    {currentCategory.name}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{currentCategory.name}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </>
        )}
        
        {topicTitle && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{topicTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

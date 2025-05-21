
import { useForumCategories } from "@/hooks/community/useForumCategories";
import { CategoryCard } from "./CategoryCard";
import { CategoryLoading } from "./CategoryLoading";
import { CategoryError } from "./CategoryError";
import { EmptyCategories } from "./EmptyCategories";
import { Grid } from "@/components/ui/grid";

interface CategoryListProps {
  onCategorySelect?: (categorySlug: string) => void;
}

export const CategoryList = ({ onCategorySelect }: CategoryListProps) => {
  const { categories, isLoading, error, refetch } = useForumCategories();
  
  // Estado de carregamento
  if (isLoading) {
    return <CategoryLoading />;
  }
  
  // Estado de erro
  if (error) {
    return <CategoryError onRetry={refetch} />;
  }
  
  // Estado vazio
  if (!categories || categories.length === 0) {
    return <EmptyCategories />;
  }
  
  return (
    <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <CategoryCard 
          key={category.id} 
          category={category} 
          onClick={() => onCategorySelect && onCategorySelect(category.slug)}
        />
      ))}
    </Grid>
  );
};


import LoadingScreen from "@/components/common/LoadingScreen";

export const CourseDetailsSkeleton = () => {
  return (
    <LoadingScreen
      message="Carregando detalhes do curso"
      variant="skeleton"
      fullScreen={false}
      className="min-h-[600px]"
    />
  );
};

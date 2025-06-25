
import LoadingScreen from "@/components/common/LoadingScreen";

export const CoursesSkeleton = () => {
  return (
    <LoadingScreen
      message="Carregando cursos"
      variant="skeleton"
      fullScreen={false}
      className="min-h-[400px]"
    />
  );
};

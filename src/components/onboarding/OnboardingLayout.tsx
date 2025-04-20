
import { ReactNode } from "react";
import { useProgress } from "@/hooks/onboarding/useProgress";
import LoadingScreen from "@/components/common/LoadingScreen";

interface OnboardingLayoutProps {
  children: ReactNode;
}

export const OnboardingLayout = ({ children }: OnboardingLayoutProps) => {
  const { isLoading } = useProgress();

  if (isLoading) {
    return <LoadingScreen message="Carregando seu onboarding..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <img
          src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
          alt="VIVER DE IA Club"
          className="h-12 mb-8"
        />
        {children}
      </div>
    </div>
  );
};

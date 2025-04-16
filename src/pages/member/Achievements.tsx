
import { useAuth } from "@/contexts/auth";
import { useAchievementsData } from "@/hooks/useAchievementsData";
import LoadingScreen from "@/components/common/LoadingScreen";
import { AchievementsTabs } from "@/components/achievements/AchievementsTabs";
import { AchievementsHeader } from "@/components/achievements/AchievementsHeader";

const Achievements = () => {
  const { user } = useAuth();
  const { loading, achievements } = useAchievementsData();

  if (loading) {
    return <LoadingScreen message="Carregando suas conquistas..." />;
  }

  return (
    <div className="space-y-6">
      <AchievementsHeader />
      <AchievementsTabs achievements={achievements} />
    </div>
  );
};

export default Achievements;

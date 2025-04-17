
import { useSearchParams } from "react-router-dom";
import { useProfileData } from "@/hooks/useProfileData";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import LoadingScreen from "@/components/common/LoadingScreen";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/tabs/ProfileTabs";

const Profile = () => {
  const { loading, profile, stats, implementations, achievements } = useProfileData();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "stats";
  
  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  if (loading) {
    return <LoadingScreen message="Carregando seu perfil..." />;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meu Perfil</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe seu progresso e conquistas
          </p>
        </div>
        <Link to="/profile/edit">
          <Button variant="outline">
            <Pencil className="mr-2 h-4 w-4" /> Editar Perfil
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProfileHeader 
          profileName={profile?.name}
          profileEmail={profile?.email}
          profileAvatar={profile?.avatar_url}
          createdAt={profile?.created_at || new Date().toISOString()}
          totalSolutions={stats.totalSolutions}
          completedSolutions={stats.completedSolutions}
          completionRate={stats.completionRate}
          avatarInitials={getInitials(profile?.name)}
        />
        
        <div className="md:col-span-2 space-y-6">
          <ProfileTabs 
            defaultTab={defaultTab}
            implementations={implementations}
            achievements={achievements}
            stats={stats}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;

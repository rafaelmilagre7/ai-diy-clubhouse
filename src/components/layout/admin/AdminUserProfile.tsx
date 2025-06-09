
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth";

export const AdminUserProfile = () => {
  const { profile } = useAuth();

  return (
    <div className="flex flex-col items-center mb-6">
      <Avatar className="h-12 w-12 border border-primary">
        <AvatarImage src={profile?.avatar_url || ""} alt={profile?.name || ""}/>
        <AvatarFallback className="bg-primary text-sm">
          {profile?.name?.charAt(0).toUpperCase() || "A"}
        </AvatarFallback>
      </Avatar>
      <p className="mt-2 font-medium text-sm text-white">{profile?.name}</p>
      <p className="text-xs text-white/60">{profile?.email}</p>
    </div>
  );
};

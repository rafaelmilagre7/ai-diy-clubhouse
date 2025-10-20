
import { useAuth } from "@/contexts/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AdminUserProfileProps {
  sidebarOpen: boolean;
}

export const AdminUserProfile = ({ sidebarOpen }: AdminUserProfileProps) => {
  const { user, profile } = useAuth();

  if (!user) return null;

  const initials = user.user_metadata?.name 
    ? user.user_metadata.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user.email?.substring(0, 2).toUpperCase() || 'AD';

  if (!sidebarOpen) {
    return (
      <div className="flex justify-center">
        <Avatar className="h-8 w-8">
          <AvatarImage 
            src={profile?.avatar_url || user.user_metadata?.avatar_url} 
            alt={user.user_metadata?.name || user.email} 
          />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <Card className="bg-surface-elevated/50 border-border/30">
      <CardContent className="p-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={profile?.avatar_url || user.user_metadata?.avatar_url} 
              alt={user.user_metadata?.name || user.email} 
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-foreground">
              {user.user_metadata?.name || profile?.name || 'Admin'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
        
        <div className="mt-2">
          <Badge variant="secondary" className="text-xs bg-status-error/20 text-status-error border-status-error/30">
            Administrador
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

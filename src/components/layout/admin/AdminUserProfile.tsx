
import { useAuth } from "@/contexts/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const AdminUserProfile = () => {
  const { user, profile } = useAuth();

  if (!user) return null;

  const initials = user.user_metadata?.name 
    ? user.user_metadata.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user.email?.substring(0, 2).toUpperCase() || 'AD';

  return (
    <Card className="bg-sidebar-accent">
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
            <p className="text-sm font-medium truncate">
              {user.user_metadata?.name || profile?.name || 'Admin'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
        
        <div className="mt-2">
          <Badge variant="secondary" className="text-xs">
            Administrador
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

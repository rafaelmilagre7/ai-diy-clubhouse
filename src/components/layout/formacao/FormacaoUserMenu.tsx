
import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface FormacaoUserMenuProps {
  sidebarOpen: boolean;
  profileName: string | null;
  profileEmail: string | null;
  profileAvatar: string | undefined;
  getInitials: (name: string | null) => string;
  signOut: () => Promise<void>;
}

export const FormacaoUserMenu = ({
  sidebarOpen,
  profileName,
  profileEmail,
  profileAvatar,
  getInitials,
  signOut,
}: FormacaoUserMenuProps) => {
  return (
    <div className="p-4">
      {sidebarOpen ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-x-4 rounded-lg p-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-800">
              <Avatar className="h-8 w-8">
                {profileAvatar ? (
                  <AvatarImage src={profileAvatar} alt={profileName || 'Avatar'} />
                ) : (
                  <AvatarFallback>{getInitials(profileName)}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col items-start text-left">
                <p className="text-sm font-medium">{profileName || "Usuário"}</p>
                <p className="text-xs text-gray-500">{profileEmail || ""}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex w-full cursor-pointer items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
                <Avatar className="h-8 w-8">
                  {profileAvatar ? (
                    <AvatarImage src={profileAvatar} alt={profileName || 'Avatar'} />
                  ) : (
                    <AvatarFallback>{getInitials(profileName)}</AvatarFallback>
                  )}
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{profileName || "Usuário"}</span>
                  <span className="text-xs font-normal text-gray-500">
                    {profileEmail || ""}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex w-full cursor-pointer items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};

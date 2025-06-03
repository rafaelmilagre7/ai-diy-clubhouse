import { Button } from "@/components/ui/button";
import { Menu, Bell, Search } from "lucide-react";
import { Link } from "react-router-dom";
interface MemberHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}
export const MemberHeader = ({
  sidebarOpen,
  setSidebarOpen
}: MemberHeaderProps) => {
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  return;
};
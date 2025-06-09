
export interface BaseSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export interface BaseContentProps extends BaseSidebarProps {
  children: React.ReactNode;
}

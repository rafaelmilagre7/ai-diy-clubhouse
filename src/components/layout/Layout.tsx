
import LayoutProvider from "./LayoutProvider";
import { ReactNode } from "react";

/**
 * Layout is the main entry point for the member area layout
 * It delegates authentication checks and layout rendering to LayoutProvider
 * Note: LayoutProvider now handles AppRoutes internally, so no children needed
 */
const Layout = ({ children }: { children: ReactNode }) => {
  // Since LayoutProvider now handles routing internally, we just return it directly
  // The children prop is no longer used but kept for backwards compatibility
  return <LayoutProvider />;
};

export default Layout;

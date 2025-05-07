
import LayoutProvider from "./LayoutProvider";
import { ReactNode } from "react";

/**
 * Layout is the main entry point for the member area layout
 * It delegates authentication checks and layout rendering to LayoutProvider
 */
const Layout = ({ children }: { children: ReactNode }) => {
  console.log("Layout principal renderizando");
  return <LayoutProvider>{children}</LayoutProvider>;
};

export default Layout;

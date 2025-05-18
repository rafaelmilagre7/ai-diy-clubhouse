
import LayoutProvider from "./LayoutProvider";
import { Outlet } from "react-router-dom";

/**
 * Layout is the main entry point for the member area layout
 * It delegates authentication checks and layout rendering to LayoutProvider
 */
const Layout = () => {
  console.log("Layout principal renderizando");
  return <LayoutProvider><Outlet /></LayoutProvider>;
};

export default Layout;


import LayoutProvider from "./LayoutProvider";

/**
 * Layout is the main entry point for the member area layout
 * It delegates authentication checks and layout rendering to LayoutProvider
 */
const Layout = () => {
  return <LayoutProvider />;
};

export default Layout;

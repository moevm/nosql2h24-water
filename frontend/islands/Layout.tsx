import { useState } from "preact/hooks";
import Navbar from "./Navbar.tsx";
import Sidebar from "./Sidebar.tsx";
import { FunctionalComponent } from "preact";

interface Props {
  children?: preact.ComponentChildren;
}

const Layout: FunctionalComponent<Props> = (
  { children },
) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <>
      <Navbar onToggleSidebar={handleToggleSidebar} />
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      >
        {children}
      </Sidebar>
    </>
  );
};

export default Layout;

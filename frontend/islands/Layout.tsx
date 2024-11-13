import { FunctionalComponent } from "preact";
import { useState } from "preact/hooks";
import Navbar from "./Navbar.tsx";
import Sidebar from "./Sidebar.tsx";
import DataDisplay from "./DataDisplay.tsx";

const Layout: FunctionalComponent = () => {
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
        <DataDisplay />
      </Sidebar>
    </>
  );
};

export default Layout;

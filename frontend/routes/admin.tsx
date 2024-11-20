import DataDisplay from "../islands/DataDisplay.tsx";
import Layout from "../islands/Layout.tsx";
import { NavbarContent, SidebarContent } from "../islands/Layout.tsx";

export default function Admin() {
  const links = (
    <ul>
      <li>
        <a href="/admin">База данных</a>
      </li>
    </ul>
  );

  return (
    <div>
      <Layout brand="Admin page">
        <SidebarContent>
          {links}
        </SidebarContent>
        <NavbarContent>
        </NavbarContent>
        <DataDisplay />
      </Layout>
    </div>
  );
}

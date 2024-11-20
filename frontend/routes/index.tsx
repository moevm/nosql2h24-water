import Layout, { NavbarContent, SidebarContent } from "../islands/Layout.tsx";
import Map from "../islands/Map.tsx";

export default function Home() {
  return (
    <div>
      <Layout brand="ОЗЕРА.ТУТ" sidebarState={false}>
        <SidebarContent>
        </SidebarContent>
        <NavbarContent>
        </NavbarContent>
        <Map />
      </Layout>
    </div>
  );
}

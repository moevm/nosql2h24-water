import { IS_BROWSER } from "$fresh/runtime.ts";
import { ComponentChild, ComponentChildren, toChildArray, VNode } from "preact";
import { useEffect, useState } from "preact/hooks";

interface LayoutProps {
  brand?: string;
  sidebarState?: boolean;
  children: preact.ComponentChildren;
}

export function SidebarContent(
  { children }: { children?: preact.ComponentChildren },
) {
  return <>{children}</>;
}

export function NavbarContent(
  { children }: { children?: preact.ComponentChildren },
) {
  return <>{children}</>;
}

export default function Layout({ brand, sidebarState, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(sidebarState || false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (typeof globalThis !== "undefined") {
        const desktop = globalThis.innerWidth >= 768;
        setIsDesktop(desktop);
        const sidebar = (sidebarState === undefined) && desktop || sidebarState;
        setSidebarOpen(sidebar);
      }
    };

    if (typeof globalThis !== "undefined") {
      handleResize();
      globalThis.addEventListener("resize", handleResize);
      return () => globalThis.removeEventListener("resize", handleResize);
    }
  }, []);

  const {
    filteredChildren: mainNavbarContent,
    matchedElements: sidebarContent,
  } = filterChildrenByTag(children, "SidebarContent");
  const {
    filteredChildren: mainContent,
    matchedElements: navbarContent,
  } = filterChildrenByTag(mainNavbarContent, "NavbarContent");

  return (
    <div class={"flex h-screen flex-col"}>
      <nav
        class={"flex items-center justify-between bg-nord10 text-nord6 text-lg"}
      >
        <div class={"flex items-center"}>
          <button
            class={"mr-4 hover:bg-nord9 p-4"}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg
              class={"h-6 w-6"}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          {isDesktop && <div class={"font-bold"}>{brand}</div>}
        </div>
        {!isDesktop && <div class={"font-bold"}>{brand}</div>}
        {isDesktop && (
          <div class={"flex items-center space-x-4 p-4"}>
            {navbarContent}
          </div>
        )}
      </nav>
      <div class={"flex flex-1"}>
        <aside
          class={`bg-nord3 text-nord6 transition-all duration-200 ${
            sidebarOpen ? "flex-shrink-0 w-auto min-w-max" : "w-0"
          } overflow-hidden`}
        >
          <div class={"p-4"}>
            {sidebarContent}
          </div>
        </aside>
        <div class={"flex flex-col flex-1"}>
          <main class={"flex-1"}>
            {mainContent}
          </main>
        </div>
      </div>
    </div>
  );
}

function isVNode(node: ComponentChild): node is VNode {
  return typeof node === "object" && node !== null && "type" in node;
}

function filterChildrenByTag(
  children: ComponentChildren,
  tagName: string,
): {
  filteredChildren: ComponentChild[] | undefined;
  matchedElements: VNode<Record<string | number | symbol, never>>[] | undefined;
} {
  if (!IS_BROWSER) { // INFO: Can't use SSR like this
    return { filteredChildren: undefined, matchedElements: undefined };
  }

  const filteredChildren: ComponentChild[] = [];
  const matchedElements: VNode<Record<string | number | symbol, never>>[] = [];

  for (const child of toChildArray(children)) {
    if (!isVNode(child)) {
      filteredChildren.push(child);
      continue;
    }

    let childTagName = "";
    if (typeof child.type === "string") {
      // DOM element tag name
      childTagName = child.type;
    }

    if (typeof child.type === "function") {
      // Component function name
      childTagName = child.type.name || "";
    }

    if (childTagName.toLowerCase() === tagName.toLowerCase()) {
      matchedElements.push(child);
    } else {
      filteredChildren.push(child);
    }
  }

  return { filteredChildren, matchedElements };
}

import { FunctionalComponent } from "preact";
import { useEffect } from "preact/hooks";

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
  children?: preact.ComponentChildren;
}

const Sidebar: FunctionalComponent<SidebarProps> = (
  { isSidebarOpen, setIsSidebarOpen, children },
) => {
  // Close sidebar on window resize if desktop
  useEffect(() => {
    const handleResize = () => {
      if (globalThis.innerWidth >= 768 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    globalThis.addEventListener("resize", handleResize);
    return () => globalThis.removeEventListener("resize", handleResize);
  }, [isSidebarOpen]);

  return (
    <div class="flex h-screen bg-nord6 text-nord0">
      {/* Sidebar */}
      <div
        class={`fixed inset-y-0 left-0 z-30 w-64 transition duration-300 transform bg-nord5 text-nord0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0`}
      >
        <div class="md:hidden flex items-center justify-between px-4 py-4">
          <h2 class="text-2xl font-bold">Меню</h2>
          <button
            class="focus:outline-none"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close Sidebar"
          >
            <svg
              class="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <nav class="mt-5">
          <a href="/" class="block px-4 py-2 hover:bg-nord4">
            Главная
          </a>
          <a href="/about" class="block px-4 py-2 hover:bg-nord4">
            О приложении
          </a>
          <a href="/contact" class="block px-4 py-2 hover:bg-nord4">
            Связаться с нами
          </a>
        </nav>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          class="fixed inset-0 z-20 bg-black opacity-50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
        </div>
      )}

      {/* Main Content */}
      <div class="flex-1 flex flex-col">
        <main class="flex-1">{children}</main>
      </div>
    </div>
  );
};

export default Sidebar;

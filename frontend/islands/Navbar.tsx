import { useState } from "preact/hooks";
import { FunctionalComponent } from "preact";

interface NavbarProps {
  onToggleSidebar: () => void;
}

const Navbar: FunctionalComponent<NavbarProps> = ({
  onToggleSidebar,
}) => {
  const [isMenuOpen, _setIsMenuOpen] = useState(false);

  return (
    <nav class="bg-nord10 text-nord0">
      <div class="container px-4 py-3 flex items-center">
        {/* Left Side */}
        <div class="flex items-center">
          {/* Sidebar Toggle Button (Visible on all screen sizes) */}
          <button
            class="ml-4 focus:outline-none"
            onClick={onToggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <svg
              class="w-6 h-6 text-nord-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 8h16M4 12h16M4 16h16"
              />
            </svg>
          </button>

          {/* Brand Icon (Visible on md and up) */}
          <a href="/" class="text-xl font-bold hidden md:block ml-4">
            ОЗЕРА.ТУТ
          </a>
        </div>

        {/* Brand Text (Centered on Mobile) */}
        <a href="/" class="text-xl font-bold mx-auto md:hidden">
          ОЗЕРА.ТУТ
        </a>

        {/* Desktop Menu (Hidden on Small Screens) */}
        <div class="hidden md:flex space-x-6 ml-auto">
          <a href="/" class="hover:underline">
            Главная
          </a>
          <a href="/about" class="hover:underline">
            О приложении
          </a>
          <a href="/contact" class="hover:underline">
            Связаться с нами
          </a>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div class="md:hidden bg-nord9">
          <a href="/" class="block px-4 py-2 hover:bg-nord10">
            Home
          </a>
          <a href="/about" class="block px-4 py-2 hover:bg-nord10">
            About
          </a>
          <a href="/contact" class="block px-4 py-2 hover:bg-nord10">
            Contact
          </a>
          {/* Button to Toggle Sidebar in Mobile Menu */}
          <button
            class="block px-4 py-2 text-left w-full focus:outline-none hover:bg-nord2"
            onClick={onToggleSidebar}
            aria-label="Toggle Sidebar"
          >
            Toggle Sidebar
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

// src/shared/components/ThemeSwitch.jsx
// Interruptor de modo oscuro. Mismo estilo de track/knob que StatusSwitch.
import { Moon, Sun } from "lucide-react";
import useTheme from "@/shared/theme/useTheme";

export default function ThemeSwitch({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    // <button> nativo: Enter y Espacio lo activan, y recibe foco con Tab
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={toggleTheme}
      className={`
        theme-switch ${isDark ? "theme-switch--active" : ""}
        w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md
        text-text-primary hover:bg-surface-muted
        focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring
        transition-colors cursor-pointer
        ${className}
      `}
    >
      <span className="theme-switch__label flex items-center gap-3 ml-3">
        {isDark ? (
          <Moon className="w-5 h-5" aria-hidden="true" />
        ) : (
          <Sun className="w-5 h-5" aria-hidden="true" />
        )}
        <span className="font-medium font-body text-base">Modo oscuro</span>
      </span>

      {/* Track */}
      <span
        aria-hidden="true"
        className={`
          theme-switch__track
          relative inline-flex items-center shrink-0 h-5 w-9 rounded-full transition-colors
          ${isDark ? "bg-green-500" : "bg-gray-300"}
        `}
      >
        {/* Knob */}
        <span
          className={`
            theme-switch__thumb
            absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform
            ${isDark ? "translate-x-full" : "translate-x-0"}
          `}
        />
      </span>
    </button>
  );
}

// src/shared/theme/useTheme.js
import { createContext, useContext } from "react";

// Clave de localStorage donde se guarda la preferencia del usuario.
// El script inline de index.html usa esta misma clave: si cambia aquí, cámbiala allí.
export const THEME_STORAGE_KEY = "cafeterito-theme";

// Contexto del tema: { theme: "light" | "dark", setTheme, toggleTheme }
export const ThemeContext = createContext(null);

// Hook para leer y cambiar el tema desde cualquier componente
export default function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  }

  return context;
}

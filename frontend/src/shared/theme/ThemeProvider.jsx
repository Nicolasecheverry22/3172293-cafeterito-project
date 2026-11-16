// src/shared/theme/ThemeProvider.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeContext, THEME_STORAGE_KEY } from "./useTheme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

// Lee la preferencia guardada. localStorage puede fallar (modo privado, bloqueado)
const readStoredTheme = () => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null;
  }
};

const getSystemTheme = () =>
  window.matchMedia?.(DARK_QUERY).matches ? "dark" : "light";

// Tema inicial: preferencia guardada → preferencia del sistema operativo
const getInitialTheme = () => readStoredTheme() ?? getSystemTheme();

export default function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  // Aplica el tema en <html data-theme="..."> (lo usan semantic.css y la variante dark:)
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Sin preferencia guardada, sigue los cambios del sistema operativo en vivo
  useEffect(() => {
    const media = window.matchMedia?.(DARK_QUERY);
    if (!media) return;

    const handleChange = (e) => {
      if (readStoredTheme() === null) {
        setThemeState(e.matches ? "dark" : "light");
      }
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  // Cambia el tema y guarda la elección del usuario
  const setTheme = useCallback((value) => {
    setThemeState(value);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, value);
    } catch {
      // Sin persistencia: el tema se aplica igual durante la sesión
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

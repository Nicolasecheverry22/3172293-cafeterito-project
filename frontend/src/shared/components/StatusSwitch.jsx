// Hook de React para manejar el estado
import { useState } from "react";

// Iconos usados dentro del switch
import { Check, X } from "lucide-react";

// Componente reutilizable para representar un switch de estado (activo/inactivo)
export default function StatusSwitch({
  checked = false,    // Valor inicial del switch (controlado desde el padre)
  onChange,           // Callback que se ejecuta cuando cambia el estado
  disabled = false,   // Permite deshabilitar la interacción
  size = "md",        // Tamaño del switch (sm, md, lg)
}) {

  // Estado interno del componente
  // Se inicializa con el valor recibido desde la prop "checked"
  const [isActive, setIsActive] = useState(checked);

  // Sincroniza el estado interno cuando el padre cambia "checked".
  // Patrón recomendado por React ("ajustar estado al cambiar una prop"): se hace
  // durante el render en lugar de en un useEffect, que provocaba un render extra.
  const [prevChecked, setPrevChecked] = useState(checked);
  if (checked !== prevChecked) {
    setPrevChecked(checked);
    setIsActive(checked);
  }

  // Función que maneja el cambio del switch
  const handleToggle = () => {

    // Si el switch está deshabilitado no permite interacción
    if (disabled) return;

    // Calcula el nuevo estado (invierte el valor actual)
    const newValue = !isActive;

    // Actualiza el estado interno
    setIsActive(newValue);

    // Si existe un callback onChange, se ejecuta
    // enviando en nuevo valor al componente padre
    if (onChange) {
        onChange(newValue);
    }
  };

  // Track: md = 52×32 (M3). Knob con 4px de margen a cada lado.
  const sizes = {
    sm: "h-6 w-10",  // 40×24 (versión compacta para tablas)
    md: "h-8 w-13",  // 52×32 (M3)
    lg: "h-9 w-16",  // 64×36
  };

  // Knob (el círculo que se mueve)
  const knobSizes = {
    sm: "h-4 w-4",   // 16px
    md: "h-6 w-6",   // 24px (M3, estado seleccionado)
    lg: "h-7 w-7",   // 28px
  };

  // Desplazamiento = ancho del track − knob − 2 × 4px de margen
  const knobOffsets = {
    sm: "translate-x-4", // 40 − 16 − 8 = 16px
    md: "translate-x-5", // 52 − 24 − 8 = 20px
    lg: "translate-x-7", // 64 − 28 − 8 = 28px
  };

  const iconSizes = { sm: 12, md: 16, lg: 18 };

  return (

    // Botón que funciona como switch
    <button
        type="button"
        role="switch"            // Lectores de pantalla: "interruptor, activado/desactivado"
        aria-checked={isActive}
        onClick={handleToggle}  // Evento que cambia el estado
        disabled={disabled}     // Permite deshabilitar el botón
        // Los comentarios // dentro del template literal acababan como clases basura:
        // ahora van fuera. touch-target: área táctil de 48px (global.css).
        // Colores semánticos: activo = success; inactivo = border-strong (≥ 3:1 sobre el fondo).
        className={`
            touch-target inline-flex items-center
            rounded-full transition-colors
            focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2
            ${sizes[size] || sizes.md}
            ${isActive ? "bg-success" : "bg-border-strong"}
            ${disabled ? "opacity-disabled cursor-not-allowed" : "cursor-pointer"}
        `}
    >
        {/*
            "Knob" del switch (el círculo que se mueve de izquierda a derecha).
            Usa el color de fondo: blanco en claro, casi negro en oscuro (como M3).
        */}
        <span
            className={`
            absolute left-1 flex items-center justify-center
            rounded-full bg-background shadow-elevation-1
            transition-transform
            ${knobSizes[size] || knobSizes.md}
            ${isActive ? knobOffsets[size] || knobOffsets.md : "translate-x-0"}
        `}
        >

        {/*
            Icono que cambia dependiendo del estado
            ✓ activo
            ✕ inactivo
        */}
        {isActive ? (
            <Check size={iconSizes[size] || 16} className="text-success" />
        ) : (
            <X size={iconSizes[size] || 16} className="text-text-secondary" />
        )}
        </span>

        </button>
    );
}
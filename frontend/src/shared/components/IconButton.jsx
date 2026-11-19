// src/shared/components/IconButton.jsx
import React from "react";
import clsx from "clsx";

/**
 * IconButton
 * - Área táctil (hit area): tamaño del botón
 * - Área visible: tamaño del icono (controlado por wrapper interno)
 */

// React.forwardRef “puente para que el padre controle el DOM interno”.

export const IconButton = React.forwardRef(function IconButton(
    {
        children,
        onClick,
        disabled = false,
        className = "",
        variant = "default",

        // Tamaños
        hitSize = 48,   // px (área táctil)
        iconSize = 24,  // px (icono visible)

        // Accesibilidad
        ariaLabel,

        // Estados
        isActive = false,

        ...props
    },
    ref
){
    const baseStyles = `
        inline-flex items-center justify-center
        rounded-full
        transition-colors duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:opacity-disabled disabled:pointer-events-none
    `;

    const variants = {
        default: `
            text-text-secondary
            hover:bg-surface-muted
            focus-visible:ring-focus-ring
        `,

        ghost: `
            text-text-secondary
            hover:bg-surface-muted/60
            focus-visible:ring-focus-ring
        `,
        primary: `
            text-text-on-brand bg-brand
            hover:bg-brand-hover
            focus-visible:ring-focus-ring
        `,
    };

    return (
        <button
            ref={ref}
            type="button"
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={onClick}
            className={clsx(baseStyles, variants[variant], className, { "bg-surface-muted": isActive,
            })}
            style={{
                width: `${hitSize}px`,
                height: `${hitSize}px`,
            }}
            {...props}
        >   
            <span
                style={{
                width: `${iconSize}px`,
                height: `${iconSize}px`,
                }}
                className="flex items-center justify-center"
            >
                {children}
            </span>
        </button>
    );
});
export default IconButton
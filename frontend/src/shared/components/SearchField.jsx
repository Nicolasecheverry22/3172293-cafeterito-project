// src/shared/components/SearchField.jsx

import { forwardRef } from "react";
import { Search, X, LoaderCircle } from "lucide-react";
import clsx from "clsx";

const baseStyles =
    "search flex items-center rounded-shape-full px-4 transition-all border";

// M3 search bar: 56px; md cumple el mínimo táctil de 48px
const sizeStyles = {
    sm: "h-10 text-sm",
    md: "h-12 text-sm",
    lg: "h-14 text-base",
};

const variantStyles = {
    // Filled: campo con fondo relleno, brode mínimo o sutil (Material "Filled TextField")
    filled: 
        "bg-surface-muted border-border-strong hover:border-text-secondary focus-within:bg-background",

        // Outlined: campo con fondo transparente y borde visible siempre.
    outlined: "bg-transparent border-border hover:border-border-strong",
};

const SearchField = forwardRef(
    (
        {
            value = "",
            placeholder = "Buscar",
            onChange = () => {},
            onSubmit,
            onClear = () => {},
            size = "md",
            variant = "filled",
            fullWidth = false,
            disabled = false,
            loading = false,
            error = false,
            name = "search",
            ariaLabel = "Campo de búsqueda",
            autoComplete = "off",
            icon,
            className,
        },
        ref
    ) => {
        const SearchIcon = icon || Search;

        const handleClear = () => {
            onChange("");
            onClear();
        };

        const handleSubmit = (e) => {
            e.preventDefault();

            if (disabled || loading) return;

            onSubmit?.(value);
        };

        return (
            <form
                onSubmit={handleSubmit}
                className={clsx(
                    baseStyles,
                    sizeStyles[size],
                    variantStyles[variant],
                    fullWidth && "w-full",
                    disabled && "opacity-60 pointer-events-none",
                    error
                        ? "border-error focus-within:ring-2 focus-within:ring-error"
                        : "focus-within:ring-2 focus-within:ring-focus-ring",
                    className,
                )}
            >
                {loading ? (
                    <LoaderCircle className="size-4 shrink-0 animate-spin text-text-muted" />
                ) : (
                    <SearchIcon className="size-4 shrink-0 text-text-muted" />
                )}

                <input
                    ref={ref}
                    type="search"
                    name={name}
                    value={value}
                    disabled={disabled}
                    placeholder={placeholder}
                    aria-label={ariaLabel}
                    autoComplete={autoComplete}
                    onChange={(e) => onChange(e.target.value)}
                    className="search__input flex-1 bg-transparent px-2 outline-none text-text-primary placeholder:text-text-muted"
                />

                {!!value && !disabled && (
                    <button
                        type="button"
                        onClick={handleClear}
                        aria-label="Limpiar búsqueda"
                        className="search__clear touch-target rounded-full p-1 hover:bg-surface-muted"
                    >
                        <X className="size-4 text-text-muted" />
                    </button>
                )}
            </form>
        );
    }
);

SearchField.displayName = "SearchField";

export default SearchField;
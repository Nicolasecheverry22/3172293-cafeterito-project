// Componente Button

export default function Button ({
    // "as" permite pintarlo como otro elemento con el mismo estilo, p. ej. as={Link}
    // para navegar: evita anidar <Link><button> (dos elementos interactivos, doble foco).
    as = "button",
    variant = "primary",
    size = "md",
    type = "button",
    className = "",
    children,
    ...props
}){
    const variants = {
        primary: "bg-brand text-text-on-brand font-semibold hover:bg-brand-hover",
        secondary: "bg-brand-soft text-text-primary hover:bg-brand-soft-hover",
        tertiary: "bg-brand-soft-two text-text-primary font-semibold hover:bg-brand-soft-two-hover"
    };

    // Alto visible 32/40px; touch-target (global.css) amplía el área clicable a 48px
    const sizes = {
        sm: "h-8 px-4",
        md: "h-10 px-4",
    };

    // Un enlace no se puede deshabilitar: deshabilitado (p. ej. sin permiso) se pinta como
    // <button disabled> y se descarta el destino.
    const isDisabledLink = props.disabled && as !== "button";
    const Component = isDisabledLink ? "button" : as;
    const elementProps = isDisabledLink
        ? Object.fromEntries(Object.entries(props).filter(([key]) => key !== "to"))
        : props;

    return(
        <Component
            // type solo tiene sentido en <button>; en un enlace sería un atributo inválido
            {...(Component === "button" ? { type } : {})}
            className={`
                touch-target
                inline-flex items-center justify-center
                whitespace-nowrap
                rounded-md
                transition-colors
                cursor-pointer
                focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2
                disabled:opacity-disabled disabled:cursor-not-allowed
                ${variants[variant]}
                ${sizes[size] || sizes.md}
                ${className}
            `}
            {...elementProps}
        >
            {children}
        </Component>
    )
}
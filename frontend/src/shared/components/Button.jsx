// Componente Button

export default function Button ({
    variant = "primary",
    size = "md",
    type = "button",
    className = "", 
    children,
    ...props
}){
    const variants = {
        primary: "bg-brand text-text-primary font-semibold hover:bg-brand-hover",
        secondary: "bg-brand-soft text-text-primary hover:bg-brand-soft-hover",
        tertiary: "bg-brand-soft-two font-semibold hover:bg-brand-soft-two-hover"
    };

    const sizes = {
        sm: `
            h-8 
            px-4 
            before:absolute before:content-['']
            before:-inset-y-[8px] before:-inset-x-[0px]
        `,
        md: `
            h-10 
            px-4 
            before:absolute before:content-['']
            before:-inset-y-[4px] before:-inset-x-[0px]
        `
    };

    return(
        <button
            type={type}
            className={`
                relative
                inline-flex items-center justify-center
                rounded-md
                transition-colors
                cursor-pointer
                ${variants[variant]}
                ${sizes[size]}
                ${className} // 2. Concatenamos las clases extra aquí
            `}
            {...props} 
        >
            {children}
        </button>
    )
}
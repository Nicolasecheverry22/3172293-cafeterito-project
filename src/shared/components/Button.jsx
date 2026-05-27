// Componente Button

export default function Button ({
    variant = "primary",
    size = "md",
    type = "button",
    children,
    ...props
}){

    const variants = {
        primary: "bg-brand text-text-primary hover:bg-brand-hover",
        secondary: "bg-brand-soft text-primary hover:bg-brand-soft-hover"
    };

    const sizes = {
        sm: `
            h-8 
            px-4 
            before:absolute before:content-['']
            before:-inset-y-[8px] before:-inset-x-[0px]
            
            `,
        md: `h-10 px-4 before:absolute before:content-['']
            before:-inset-y-[4px] before:-inset-x-[0px]`
    };
    return(
        <button
            type={type}
            className={`
                relative
                inline-flex items-center justify-center
                rounded-md
                transition-colors
                ${variants[variant]}
                ${sizes[size]}
                `}
                {...props}
        >
            {children}

        </button>
    )
}
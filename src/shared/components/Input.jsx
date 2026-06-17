export default function Input({
    label,
    error,
    htmlFor,
    type = "text",
    variant = "primary",
    size = "md",
    ...props
}){
    const variants = {
        // Estos valores deben ser con variables
        primary: `
            bg-background 
            border-border 
            text-text-primary
        `,
        secondary: `
            bg-surface-muted
            border-border-strong
            text-text-primary
        `,
        tertiary: `
            bg-transparent
            border-b-2 border-border
            text-text-primary     
        `
    };
    const sizes = {
        sm: `
            h-8
        `,
        md: `
            h-10
        `,
        lg: `
            h-12    
        `
    }

    return(
        <div className="w-80">

            {/*Label*/}
            <label 
                // htmlFor con kebab-case
                htmlFor={htmlFor}
                className={`
                    block
                    text-caption
                    text-secondary
                    font-label
                    ${
                        size === "sm"
                        ? "-mb-2"
                        : size === "md"
                            ? "mb-0"
                            : "mb-1"
                    }
                    ${error ? "text-red-800" : "text-caption"}

                `}
                >
                {label}

            </label>

                {/* Contenedor de input */}
            <div
                className="
                relative flex items-center w-full
                "
            >
                {/* Área interactiva invisible (48px) */}

            <div
                className="
                    absolute
                    inset-0
                "   
                onMouseDown={(e) => {
                    e.preventDefault();

                    //Mueve el foco al siguiente modo hermando en el dom
                    //nextsiblings puede ser texto; si no es elemento valido,
                    // focus() falla
                    e.currentTarget.nextSibling.focus();
                }}
            />

            {/* Input visual */}
            <input
                id={htmlFor}
                type={type}
                error={error}
                className={`
                    relative
                    w-full
                    rounded-md
                    border-border
                    px-4
                    text-bodyrelative
                    w-full
                    round-md
                    border
                    px-4
                    text-body

                    focus:outline-none
                    focus:ring-2
                    focus:ring-ring
                    focus:ring-brand
                    ${variants[variant]}
                    ${sizes[size]}
                    ${error ? "border-red-800" : "border border-border"}
                `}
            {...props}
            />

            </div>

            {/* Feedback */}
            {error && (
                <p className="text-caption text-error place-self-start">{error}</p>
            )}



        </div>
    )
}
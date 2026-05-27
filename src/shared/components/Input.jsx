export default function Input({
    label,
    htmlFor,
    type = "text",
    variant = "primary",
    size = "small",
    ...props
}){
    const variants = {
        // Estos valores deben ser con variables
        primary: `
            border-brand
            bg-background
        `,
        secondary: `
            border-red-950
            bg-gray-300
        `,
        tertiary: `
            border-green-950        
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
                    ${
                        size === "sm"
                        ? "-mb-2"
                        : size === "md"
                            ? "mb-0"
                            : "mb-1"
                    }
                `}
                >
                {label}

            </label>

                {/* Contenedor de input */}
            <div
                className="
                    relative
                    h-12
                    flex
                    items-center
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
                `}
            {...props}
            />

            </div>





        </div>
    )
}
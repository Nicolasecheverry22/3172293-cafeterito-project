// Componente Select

export default function Select({
    label,
    error,
    htmlFor,
    name,
    onChange,
    value,
    options = [],
    className = "",
}){
    return (
        <div className={`w-full flex flex-col gap-1 ${className}`}>
            {/* Label solo se muestra si es Truthy un uno logico */}
            {label && (
              <label
                htmlFor={htmlFor}
                  className={`block text-caption font-label ${
                    error ? "text-error" : "text-secondary"
                  }`}
              >
                {label}
              </label>
            )}
            {/* Select */}
            <select 
                name={name} 
                onChange={onChange}
                value={value}
                id={htmlFor}
                className="
                    w-full
                    h-12
                    rounded-md
                    border
                    bg-background
                    px-4
                    text-body
                    font-body
                    text-text-primary
                    outline-none
                    transition-all
                    cursor-pointer
                    border-border
                    hover:border-border-strong
                    focus:border-focus-ring
                    focus:ring-1
                    focus:ring-focus-ring
                "
            >
                <option value="">Seleccione una opción</option>

                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="text-caption text-error place-self-start mt-1">{error}</p>
            )}
        </div>
    )
}
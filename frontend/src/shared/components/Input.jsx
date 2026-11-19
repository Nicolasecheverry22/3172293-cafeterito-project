export default function Input({
  label,
  error,
  htmlFor,
  type = "text",
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const variants = {
    primary: "bg-background border-border text-text-primary",
    secondary: "bg-surface-muted border-border-strong text-text-primary",
    tertiary: "bg-transparent border-b-2 border-border text-text-primary",
  };

  const sizes = {
    // M3: mínimo 48px de área táctil; lg = 56px (alto estándar de text field)
    sm: "h-10 text-xs",
    md: "h-12 text-sm",
    lg: "h-14 text-base",
  };

  return (
    <div className={`w-full flex flex-col gap-1 ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={htmlFor}
          className={`block text-small font-label ${
            error ? "text-error" : "text-text-secondary"
          }`}
        >
          {label}
        </label>
      )}

      {/* Contenedor de input */}
      <div className="relative flex items-center w-full">
        {/* Input visual */}
        <input
          id={htmlFor}
          type={type}
          className={`
            w-full
            rounded-shape-xs
            border
            px-4
            text-body
            transition-colors
            focus:outline-none
            focus:ring-2
            focus:ring-focus-ring
            ${variants[variant] || variants.primary}
            ${sizes[size] || sizes.md}
            ${error ? "border-error focus:ring-error" : "border-border"}
          `}
          {...props} 
        />
      </div>

      {error && (
        <p className="text-small text-error place-self-start px-4">
          {error}
        </p>
      )}
    </div>
  );
}
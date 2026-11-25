import { useState, useId } from "react"
import { Eye, EyeOff, AlertCircle } from "lucide-react"

export default function Input({
  label,
  error,
  htmlFor,
  type = "text",
  variant = "primary",
  size = "md",
  className = "",
  id,
  ...props
}) {
  const generatedId = useId()
  const inputId = htmlFor || id || generatedId

  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = type === "password"
  const resolvedType = isPassword ? (showPassword ? "text" : "password") : type

  const variants = {
    primary:
      "bg-background text-text-primary border-border-strong shadow-elevation-1 hover:bg-surface-muted/40 hover:shadow-elevation-2",
    secondary:
      "bg-surface text-text-primary border-border-strong shadow-elevation-1 hover:bg-surface-muted hover:shadow-elevation-2",
    tertiary:
      "bg-transparent text-text-primary border-b-2 border-border-strong rounded-none px-1 shadow-none hover:border-focus-ring",
  }

  const sizes = {
    sm: "h-10 text-xs sm:text-sm",
    md: "h-12 text-sm sm:text-body",
    lg: "h-14 text-base",
  }

  const stateClasses = error
    ? "border-2 border-error focus:border-error focus:ring-2 focus:ring-error/40"
    : isFocused && variant !== "tertiary"
    ? "border-2 border-focus-ring ring-2 ring-focus-ring/30 shadow-elevation-2"
    : isFocused && variant === "tertiary"
    ? "border-b-2 border-focus-ring"
    : ""

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`inline-flex items-center text-small font-label tracking-wide transition-colors ${
            error
              ? "text-error font-semibold"
              : isFocused
              ? "text-text-primary font-semibold"
              : "text-text-primary"
          }`}
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center w-full">
        <input
          id={inputId}
          type={resolvedType}
          aria-invalid={Boolean(error)}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          className={`
            w-full
            ${variant === "tertiary" ? "" : "rounded-shape-md"}
            border
            ${variant === "tertiary" ? "px-1" : "px-4"}
            ${isPassword ? "pr-11" : ""}
            font-body
            placeholder:text-text-secondary
            disabled:bg-surface-muted disabled:text-text-secondary disabled:opacity-60 disabled:cursor-not-allowed
            transition-all duration-200
            focus:outline-none
            ${variants[variant] || variants.primary}
            ${sizes[size] || sizes.md}
            ${stateClasses}
          `}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="
              absolute right-2.5
              inline-flex h-8 w-8 items-center justify-center
              rounded-shape-full
              border border-border
              bg-surface text-text-primary
              hover:bg-surface-muted hover:border-border-strong
              active:scale-95
              transition-all duration-150
              cursor-pointer
            "
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Eye className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="inline-flex items-center gap-1.5 text-small font-medium text-error px-1 pt-0.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
// Componente Button centralizado (Material Design 3)
// Cambia VARIANTS, SIZES o SHAPES aquí para actualizar todos los botones del proyecto.

const VARIANTS = {
  primary:
    "bg-brand text-text-on-brand font-bold border-2 border-border-strong shadow-elevation-2 hover:bg-brand-hover hover:shadow-elevation-3",
  secondary:
    "bg-surface text-text-primary font-semibold border-2 border-border-strong shadow-elevation-1 hover:bg-surface-muted hover:shadow-elevation-2",
  tertiary:
    "bg-brand-soft text-text-primary font-semibold border border-border-strong shadow-elevation-1 hover:bg-brand-soft-hover",
  outline:
    "bg-background text-text-primary font-semibold border-2 border-border-strong hover:bg-surface-muted",
  ghost:
    "bg-transparent text-text-primary font-semibold border border-transparent hover:bg-surface-muted hover:border-border",
  cancel:
    "bg-error/20 text-text-primary font-bold border-2 border-error shadow-elevation-1 hover:bg-error hover:text-on-error hover:shadow-elevation-2",
  danger:
    "bg-error text-on-error font-bold border-2 border-border-strong shadow-elevation-1 hover:opacity-90",

  // Acciones por fila con contraste ≥ 3:1 según tema y fondo
  success:
    "bg-transparent text-success font-semibold border border-transparent hover:bg-success-container hover:text-on-success-container",
  info:
    "bg-transparent text-info font-semibold border border-transparent hover:bg-info-container hover:text-on-info-container",
  edit:
    "bg-transparent text-warning font-semibold border border-transparent hover:bg-warning-container hover:text-on-warning-container",
  detail:
    "bg-transparent text-text-primary font-semibold border border-transparent hover:bg-background-inverse hover:text-text-inverse",
  enable:
    "bg-transparent text-success font-semibold border border-transparent hover:bg-success-container hover:text-on-success-container",
  disable:
    "bg-transparent text-error font-semibold border border-transparent hover:bg-error-container hover:text-on-error-container",
  warm:
    "bg-brand-soft-two text-text-primary font-semibold border-2 border-border-strong shadow-elevation-1 hover:bg-brand-soft-two-hover",
}

const ACTIVE_VARIANTS = {
  primary:
    "bg-brand text-text-on-brand font-bold border-2 border-border-strong shadow-elevation-2 ring-2 ring-focus-ring/40",
  secondary:
    "bg-brand text-text-on-brand font-bold border-2 border-border-strong shadow-elevation-2",
  tertiary:
    "bg-brand text-text-on-brand font-bold border-2 border-border-strong shadow-elevation-2",
  outline:
    "bg-surface-muted text-text-primary font-bold border-2 border-focus-ring shadow-elevation-1",
  ghost:
    "bg-surface-muted text-text-primary font-bold border border-border-strong",
  cancel:
    "bg-error text-on-error font-bold border-2 border-border-strong shadow-elevation-2",
  danger:
    "bg-error text-on-error font-bold border-2 border-border-strong ring-2 ring-focus-ring/40",
  success:
    "bg-success-container text-on-success-container font-bold border border-success",
  info:
    "bg-info-container text-on-info-container font-bold border border-info",
  edit:
    "bg-surface-muted text-text-primary font-bold border border-border-strong",
  detail:
    "bg-background-inverse text-text-inverse font-bold border border-border-strong",
  enable:
    "bg-success-container text-on-success-container font-bold border border-success",
  disable:
    "bg-error-container text-on-error-container font-bold border border-error",
}

// Alto visible accesible; touch-target amplía el área clicable a 48px
const SIZES = {
  xs: "h-8 px-2.5 text-xs gap-1.5",
  sm: "h-9 px-3.5 text-xs sm:text-sm gap-2",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
}

const SHAPES = {
  default: "rounded-shape-md",
  pill: "rounded-shape-full",
}

export default function Button({
  as = "button",
  variant = "primary",
  size = "md",
  shape = "default",
  active = false,
  type = "button",
  className = "",
  children,
  ...props
}) {
  const isDisabledLink = props.disabled && as !== "button"
  const Component = isDisabledLink ? "button" : as
  const elementProps = isDisabledLink
    ? Object.fromEntries(Object.entries(props).filter(([key]) => key !== "to"))
    : props

  const variantClasses = active
    ? ACTIVE_VARIANTS[variant] || ACTIVE_VARIANTS.primary
    : VARIANTS[variant] || VARIANTS.primary

  return (
    <Component
      {...(Component === "button" ? { type } : {})}
      className={`
        touch-target
        inline-flex items-center justify-center leading-none
        whitespace-nowrap
        select-none
        transition-all duration-150
        cursor-pointer
        active:scale-[0.98]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2
        disabled:opacity-disabled disabled:cursor-not-allowed disabled:active:scale-100
        ${SHAPES[shape] || SHAPES.default}
        ${SIZES[size] || SIZES.md}
        ${variantClasses}
        ${className}
      `}
      {...elementProps}
    >
      {children}
    </Component>
  )
}

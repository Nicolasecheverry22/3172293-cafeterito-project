import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  cloneElement
} from "react"

// Sin export: solo lo usan los componentes de este archivo, y exportarlo
// rompía el Fast Refresh de Vite (react-refresh/only-export-components)
const DropdownContext = createContext(null)

export function Dropdown({
  children,
  open: controlledOpen,
  onOpenChange,
  className = ""
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = (value) => {
    if (isControlled) {
      onOpenChange?.(value)
    } else {
      setUncontrolledOpen(value)
    }
  }

  const containerRef = useRef(null)

  // Los listeners se registran una sola vez y capturaban el setOpen del primer
  // render (en modo controlado llamaban a un onOpenChange viejo). La ref siempre
  // apunta a la versión actual.
  const setOpenRef = useRef(setOpen)
  useEffect(() => {
    setOpenRef.current = setOpen
  })

  // Click outside + tecla Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenRef.current(false)
      }
    }
    const handleEscape = (e) => {
      if (e.key === "Escape") setOpenRef.current(false)
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className={`relative inline-block ${className}`}>
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

export function DropdownTrigger({ children }) {
  const { open, setOpen } = useContext(DropdownContext)

  if (!children) return null

  return cloneElement(children, {
    onClick: (e) => {
      children.props.onClick?.(e)
      setOpen(!open)
    },
    "aria-expanded": open,
    "aria-haspopup": "menu"
  })
}

export function DropdownContent({ children, className = "" }) {
  const { open } = useContext(DropdownContext)

  if (!open) return null

  return (
    <div
      role="menu"
      className={`
        absolute
        mt-2
        min-w-48
        bg-background
        border border-border
        text-text-primary
        py-2
        shadow-elevation-2
        rounded-shape-xs
        overflow-hidden
        z-50
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export function DropdownItem({
  children,
  onClick,
  className = "",
  ...props
}) {
  const { setOpen } = useContext(DropdownContext)

  const handleClick = (e) => {
    onClick?.(e)
    setOpen(false)
  }

  return (
    <button
      type="button"
      role="menuitem"
      {...props}
      onClick={handleClick}
      className={`
        w-full min-h-touch flex items-center text-left px-3 cursor-pointer
        hover:bg-surface-muted focus:bg-surface-muted focus:outline-none
        transition-colors
        ${className}
      `}
    >
      {children}
    </button>
  )
}
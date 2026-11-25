import { useState, useRef, useEffect, useId } from "react"
import { ChevronsUpDown, Check, AlertCircle } from "lucide-react"

export default function Select({
  label,
  error,
  htmlFor,
  name,
  onChange,
  value = "",
  options = [],
  placeholder = "Seleccione una opción",
  disabled = false,
  className = "",
}) {
  const generatedId = useId()
  const fieldId = htmlFor || name || generatedId
  const listboxId = `${fieldId}-listbox`

  const containerRef = useRef(null)
  const optionRefs = useRef([])

  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const selectedIndex = options.findIndex(
    (opt) => String(opt.value) === String(value)
  )
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null

  useEffect(() => {
    if (!isOpen) return

    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || highlightedIndex < 0) return
    optionRefs.current[highlightedIndex]?.scrollIntoView({
      block: "nearest",
    })
  }, [isOpen, highlightedIndex])

  const emitChange = (nextValue) => {
    if (!onChange) return
    onChange({
      target: {
        name: name ?? "",
        value: nextValue,
      },
    })
  }

  const openMenu = (startIndex = selectedIndex >= 0 ? selectedIndex : 0) => {
    if (disabled || options.length === 0) return
    setIsOpen(true)
    setHighlightedIndex(startIndex)
  }

  const handleSelectOption = (opt) => {
    if (opt?.disabled) return
    emitChange(opt.value)
    setIsOpen(false)
  }

  const handleTriggerKeyDown = (e) => {
    if (disabled) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      if (!isOpen) {
        openMenu(selectedIndex >= 0 ? selectedIndex : 0)
      } else {
        setHighlightedIndex((prev) =>
          prev < options.length - 1 ? prev + 1 : 0
        )
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (!isOpen) {
        openMenu(selectedIndex >= 0 ? selectedIndex : options.length - 1)
      } else {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : options.length - 1
        )
      }
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      if (!isOpen) {
        openMenu(selectedIndex >= 0 ? selectedIndex : 0)
      } else if (highlightedIndex >= 0 && options[highlightedIndex]) {
        handleSelectOption(options[highlightedIndex])
      }
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex flex-col gap-1.5 ${className}`}
    >
      {label && (
        <label
          htmlFor={fieldId}
          className={`inline-flex items-center justify-between text-small font-label tracking-wide transition-colors ${
            error
              ? "text-error font-semibold"
              : isOpen
              ? "text-text-primary font-semibold"
              : "text-text-primary"
          }`}
        >
          <span>{label}</span>
        </label>
      )}

      <button
        id={fieldId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-invalid={Boolean(error)}
        disabled={disabled}
        onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        className={`group relative w-full h-12 px-4 rounded-shape-md border-2 text-left text-body font-body flex items-center justify-between gap-3 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
          disabled
            ? "bg-surface-muted border-border text-text-secondary opacity-60 cursor-not-allowed"
            : error
            ? "bg-surface border-error text-text-primary shadow-elevation-1"
            : isOpen
            ? "bg-surface border-focus-ring text-text-primary shadow-elevation-3"
            : "bg-surface border-border-strong text-text-primary shadow-elevation-2 hover:bg-surface-muted hover:shadow-elevation-3 active:scale-[0.995]"
        }`}
      >
        <span className="flex items-center gap-2.5 min-w-0 flex-1">
          {selectedOption && (
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-shape-full bg-brand border border-border-strong"
              aria-hidden="true"
            />
          )}
          <span
            className={`truncate ${
              selectedOption
                ? "text-text-primary font-semibold"
                : "text-text-primary/85 font-medium"
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>

        <span
          className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-shape-full border transition-all duration-200 ${
            isOpen
              ? "bg-brand text-text-on-brand border-border-strong rotate-180 shadow-elevation-1"
              : "bg-surface-muted text-text-primary border-border-strong group-hover:bg-brand group-hover:text-text-on-brand"
          }`}
          aria-hidden="true"
        >
          <ChevronsUpDown className="w-4 h-4" />
        </span>
      </button>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={label || placeholder}
          className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-60 overflow-y-auto rounded-shape-lg border-2 border-border-strong bg-surface p-1.5 shadow-elevation-3 origin-top animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {options.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {options.map((opt, index) => {
                const isSelected = String(opt.value) === String(value)
                const isHighlighted = index === highlightedIndex
                const isOptionDisabled = Boolean(opt.disabled)

                return (
                  <li
                    key={opt.value}
                    ref={(el) => {
                      optionRefs.current[index] = el
                    }}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={isOptionDisabled}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => handleSelectOption(opt)}
                    className={`group/item flex items-center justify-between gap-3 rounded-shape-sm px-3.5 py-2.5 text-sm transition-all duration-150 select-none ${
                      isOptionDisabled
                        ? "opacity-50 cursor-not-allowed text-text-secondary"
                        : "cursor-pointer"
                    } ${
                      isSelected
                        ? "bg-brand text-text-on-brand font-bold border-l-4 border-border-strong shadow-elevation-1"
                        : isHighlighted
                        ? "bg-surface-muted text-text-primary font-semibold border-l-4 border-focus-ring translate-x-0.5"
                        : "text-text-primary hover:bg-surface-muted border-l-4 border-transparent"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>

                    {isSelected && (
                      <Check
                        className="w-4 h-4 shrink-0 text-text-on-brand stroke-[2.5]"
                        aria-hidden="true"
                      />
                    )}
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center text-xs text-text-secondary">
              No hay opciones disponibles
            </div>
          )}
        </div>
      )}

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
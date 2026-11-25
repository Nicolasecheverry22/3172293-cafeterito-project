import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table"
import { useState, useMemo } from "react"
import {
  Search,
  X,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Inbox,
  Sparkles,
} from "lucide-react"
import { Button, Select, Input } from "@/shared"

const PAGE_SIZE_OPTIONS = [5, 7, 10, 20, 50].map((size) => ({
  value: size,
  label: `${size} filas`,
}))

// Filtro global personalizado:
// Si la columna define meta.searchValue(row.original) se busca sobre ese texto
// (útil para columnas booleanas o compuestas); si no, sobre row.getValue().
const globalSearchFilter = (row, columnId, filterValue) => {
  const search = String(filterValue ?? "").trim().toLowerCase()
  if (!search) return true

  const column = row.getAllCells().find((cell) => cell.column.id === columnId)?.column
  const searchValue = column?.columnDef.meta?.searchValue

  const value = searchValue ? searchValue(row.original) : row.getValue(columnId)
  if (value === null || value === undefined) return false

  return String(value).toLowerCase().includes(search)
}

// Clases literales para que Tailwind v4 genere las utilidades responsive correctamente.
// La columna de acciones nunca se oculta.
const HIDE_BELOW = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
}

const responsiveClass = (column) =>
  column.id === "actions" ? "" : HIDE_BELOW[column.columnDef.meta?.hideBelow] ?? ""

export default function DataTable({ data = [], columns = [] }) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  })

  const [globalFilter, setGlobalFilter] = useState("")
  const [jumpPageInput, setJumpPageInput] = useState("1")

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      pagination,
    },
    onPaginationChange: (updater) => {
      setPagination((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater
        setJumpPageInput(String(next.pageIndex + 1))
        return next
      })
    },
    onGlobalFilterChange: setGlobalFilter,
    getColumnCanGlobalFilter: (column) => column.id !== "actions",
    globalFilterFn: globalSearchFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const filteredRows = table.getFilteredRowModel().rows
  const pageRows = table.getRowModel().rows
  const pageCount = Math.max(table.getPageCount(), 1)
  const currentPageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize

  const rangeInfo = useMemo(() => {
    const totalFiltered = filteredRows.length
    if (totalFiltered === 0) return { start: 0, end: 0, total: 0 }
    const start = currentPageIndex * pageSize + 1
    const end = Math.min(start + pageRows.length - 1, totalFiltered)
    return { start, end, total: totalFiltered }
  }, [filteredRows.length, currentPageIndex, pageSize, pageRows.length])

  const handleClearSearch = () => {
    setGlobalFilter("")
    setPagination((prev) => {
      setJumpPageInput("1")
      return { ...prev, pageIndex: 0 }
    })
  }

  const handleJumpPageChange = (e) => {
    const raw = e.target.value
    setJumpPageInput(raw)

    const parsed = Number(raw)
    if (!raw || Number.isNaN(parsed)) return

    const clampedPage = Math.min(Math.max(Math.trunc(parsed), 1), pageCount) - 1
    table.setPageIndex(clampedPage)
  }

  const handleJumpPageBlur = () => {
    setJumpPageInput(String(currentPageIndex + 1))
  }

  return (
    <div className="w-full space-y-3.5">
      {/* ================== TOOLBAR SUPERIOR ================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-shape-lg border border-border-strong bg-surface p-3 shadow-elevation-2">
        {/* Buscador global */}
        <div className="relative w-full sm:w-72 lg:w-80">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary transition-colors"
            aria-hidden="true"
          />
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => {
              setGlobalFilter(e.target.value)
              setJumpPageInput("1")
              setPagination((prev) => ({ ...prev, pageIndex: 0 }))
            }}
            placeholder="Buscar en registros..."
            aria-label="Buscar en la tabla"
            className="h-10 w-full rounded-shape-full border border-border-strong bg-background pl-10 pr-10 text-sm text-text-primary placeholder:text-text-secondary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-focus-border"
          />

          {globalFilter && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Limpiar búsqueda"
              title="Limpiar búsqueda"
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-shape-full bg-surface-muted text-text-primary border border-border hover:bg-brand hover:text-text-on-brand active:scale-90 transition-all duration-150"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Selector de filas por página */}
        <div className="w-36 self-end sm:self-auto">
          <Select
            name="pageSize"
            value={pageSize}
            options={PAGE_SIZE_OPTIONS}
            compact
            onChange={(e) => {
              table.setPageSize(Number(e.target.value))
              setJumpPageInput("1")
            }}
            aria-label="Filas por página"
          />
        </div>
      </div>

      {/* ================== CUERPO PRINCIPAL DE LA TABLA ================== */}
      <div className="w-full rounded-shape-lg border border-border-strong bg-background shadow-elevation-3 overflow-hidden">
        <div className="w-full max-h-[58vh] overflow-auto">
          <table className="group/table w-full min-w-full table-auto border-separate border-spacing-0 text-left text-text-primary">
            {/* CABECERA STICKY DE ANCHO COMPLETO, PESO UNIFORME Y CONTRASTE >= 3:1 */}
            <thead className="sticky top-0 z-10 bg-surface">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-surface">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      scope="col"
                      className={`bg-surface border-b-2 border-border-strong px-3.5 lg:px-4 py-2.5 text-xs uppercase tracking-wider !font-bold text-text-primary whitespace-nowrap select-none [&_button]:!font-bold [&_button]:text-xs [&_button]:tracking-wider [&_button]:uppercase [&_button]:text-text-primary [&_span]:!font-bold ${responsiveClass(
                        header.column
                      )}`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            {/* FILAS SIEMPRE COMPACTAS */}
            <tbody className="bg-background">
              {pageRows.length > 0 ? (
                pageRows.map((row) => (
                  <tr
                    key={row.id}
                    className="group/row transition-all duration-200 ease-out hover:bg-surface-muted group-hover/table:opacity-80 hover:!opacity-100"
                  >
                    {row.getVisibleCells().map((cell, idx) => (
                      <td
                        key={cell.id}
                        className={`border-b border-border px-3.5 lg:px-4 py-1.5 text-sm text-text-primary transition-all duration-200 ease-out ${
                          idx === 0
                            ? "border-l-4 border-l-transparent group-hover/row:border-l-focus-ring group-hover/row:pl-4"
                            : ""
                        } ${responsiveClass(cell.column)}`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={table.getAllLeafColumns().length || 1}
                    className="px-6 py-12 text-center"
                  >
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2.5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-shape-full bg-surface-muted border border-border-strong text-text-primary shadow-elevation-1">
                        <Inbox className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-text-primary">
                          Sin resultados por aquí
                        </p>
                        <p className="text-xs text-text-secondary">
                          {globalFilter
                            ? `No encontramos coincidencias para "${globalFilter}".`
                            : "Todavía no hay registros cargados en esta vista."}
                        </p>
                      </div>
                      {globalFilter && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={handleClearSearch}
                          className="mt-1"
                        >
                          Restablecer búsqueda
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================== FOOTER Y PAGINACIÓN ================== */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-shape-lg border border-border-strong bg-surface px-4 py-2.5 shadow-elevation-1">
        {/* Izquierda: Contador único de registros */}
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs sm:text-sm font-medium text-text-primary">
          <span>
            Mostrando{" "}
            <strong className="font-bold text-text-primary tabular-nums">
              {rangeInfo.start}
            </strong>
            {rangeInfo.total > 0 && (
              <>
                {"–"}
                <strong className="font-bold text-text-primary tabular-nums">
                  {rangeInfo.end}
                </strong>
              </>
            )}{" "}
            de{" "}
            <strong className="font-bold text-text-primary tabular-nums">
              {rangeInfo.total}
            </strong>{" "}
            registros
          </span>

          {globalFilter && (
            <span className="inline-flex items-center gap-1 rounded-shape-full bg-brand text-text-on-brand border border-border-strong px-2.5 py-0.5 text-xs font-semibold">
              <Sparkles className="w-3 h-3" aria-hidden="true" />
              <span>"{globalFilter}"</span>
            </span>
          )}
        </div>

        {/* Centro: Controles de paginación */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="max-sm:hidden transition-transform active:scale-95"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="Ir a la primera página"
          >
            <ChevronsLeft className="w-4 h-4" aria-hidden="true" />
            <span className="hidden md:inline">Inicio</span>
          </Button>

          <Button
            size="sm"
            variant="secondary"
            className="transition-transform active:scale-95"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            <span>Anterior</span>
          </Button>

          <span
            className="px-3 py-1 rounded-shape-xs bg-background border border-border-strong text-xs sm:text-sm font-semibold text-text-primary tabular-nums whitespace-nowrap shadow-inner"
            aria-live="polite"
          >
            <strong>{currentPageIndex + 1}</strong> / <strong>{pageCount}</strong>
          </span>

          <Button
            size="sm"
            className="transition-transform active:scale-95"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Página siguiente"
          >
            <span>Siguiente</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Button>

          <Button
            size="sm"
            className="max-sm:hidden transition-transform active:scale-95"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Ir a la última página"
          >
            <span className="hidden md:inline">Final</span>
            <ChevronsRight className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Derecha: Ir a página */}
       {/* Derecha: Ir a página */}
        <div className="hidden lg:flex items-center justify-end">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-text-primary">
            <Input
              label="Página:"
              htmlFor="datatable-jump-page"
              type="number"
              size="sm"
              min={1}
              max={pageCount}
              value={jumpPageInput}
              onChange={handleJumpPageChange}
              onBlur={handleJumpPageBlur}
              aria-label="Ir a página número"
              className="!w-auto flex-row items-center gap-2 space-y-0"
              inputClassName="w-16 text-center font-bold tabular-nums px-2"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
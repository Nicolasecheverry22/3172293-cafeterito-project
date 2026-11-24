import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getFilteredRowModel
} from "@tanstack/react-table"

// Hook de React para manejar estado
import { useState } from "react"

// ================== FILTRO GLOBAL PERSONALIZADO ==================
// Si la columna define meta.searchValue(row.original) se busca sobre ese texto
// (útil para columnas booleanas como "Estado"); si no, sobre row.getValue().
// La comparación es en minúsculas y por coincidencia parcial.
const globalSearchFilter = (row, columnId, filterValue) => {
  const search = String(filterValue ?? "").trim().toLowerCase()
  if (!search) return true

  const column = row.getAllCells().find(cell => cell.column.id === columnId)?.column
  const searchValue = column?.columnDef.meta?.searchValue

  const value = searchValue ? searchValue(row.original) : row.getValue(columnId)
  if (value === null || value === undefined) return false

  return String(value).toLowerCase().includes(search)
}

// Columnas de baja prioridad: meta.hideBelow = "sm" | "md" | "lg" | "xl" las oculta por debajo
// de ese breakpoint (clases literales para que Tailwind las genere). La columna de
// acciones nunca se oculta.
const HIDE_BELOW = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
}
const responsiveClass = (column) =>
  column.id === "actions" ? "" : HIDE_BELOW[column.columnDef.meta?.hideBelow] ?? ""

// Botón reutilizable del sistema de componentes
import { Button } from "@/shared"

// Componente reutilizable de tabla
// Recibe:
// - data: datos que se mostrarán
// - columns: configuración de columnas
export default function DataTable({ data, columns }) {

  // ================== ESTADO DE PAGINACIÓN ==================
  // pageIndex → página actual
  // pageSize → cantidad de filas por página
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5
  })

  // ================== ESTADO DEL FILTRO GLOBAL ==================
  // Se usa para el buscador de la tabla
  const [globalFilter, setGlobalFilter] = useState("")

  // ================== CONFIGURACIÓN DE LA TABLA ==================
  const table = useReactTable({
    // Datos que se mostrarán
    data,

    // Definición de columnas
    columns,

    // Estado controlado de la tabla
    state: {
      globalFilter,
      pagination
    },

    // Función que se ejecuta cuando cambia la paginación
    onPaginationChange: setPagination,

    // Función que se ejecuta cuando cambia el filtro global
    onGlobalFilterChange: setGlobalFilter,

    // Todas las columnas participan en la búsqueda excepto "Acciones"
    getColumnCanGlobalFilter: (column) => column.id !== "actions",

    // Filtro que entiende meta.searchValue (columnas booleanas)
    globalFilterFn: globalSearchFilter,

    // Modelo base de filas
    getCoreRowModel: getCoreRowModel(),

    // Modelo con filtrado aplicado
    getFilteredRowModel: getFilteredRowModel(),

    // Modelo con paginación aplicada
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="space-y-4">

      {/* ================== TOOLBAR ================== */}
      {/* Barra superior con buscador y selector de filas */}

      <div className="flex items-center justify-between gap-2 sm:gap-4">

        {/* ================== BUSCADOR ================== */}
        {/* Filtra todas las columnas de la tabla */}
        <input
          type="text"
          placeholder="Buscar..."
          value={globalFilter ?? ""}
          onChange={(e) => {
            setGlobalFilter(e.target.value)
            // Al cambiar la búsqueda se vuelve a la primera página
            setPagination(prev => ({ ...prev, pageIndex: 0 }))
          }}
          className="h-12 border border-border-strong rounded-shape-xs px-4 w-full min-w-0 sm:w-64 bg-background text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-focus-ring"
        />

        {/* ================== SELECTOR DE FILAS ================== */}
        {/* Permite cambiar cuántas filas se muestran por página */}
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          aria-label="Filas por página"
          className="h-12 shrink-0 border border-border-strong rounded-shape-xs px-3 bg-background text-text-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-focus-ring"
        >
          {[5, 7, 10, 20, 50].map(size => (
            <option key={size} value={size}>
              {size} filas
            </option>
          ))}
        </select>

      </div>

      {/* ================== TABLA ================== */}
      <div className="overflow-x-auto border border-border-strong rounded-shape-md bg-background">
        <table className="w-full bg-background text-text-primary">

          {/* ================== CABECERA ================== */}
          <thead className="bg-brand-soft-two text-text-primary">

            {/* TanStack agrupa cabeceras automáticamente */}
            {table.getHeaderGroups().map(headerGroup => (

              <tr key={headerGroup.id}>

                {headerGroup.headers.map(header => (

                  <th
                    key={header.id}
                    className={`px-3 lg:px-4 py-3 text-left border-b border-border-strong text-text-primary whitespace-nowrap ${responsiveClass(header.column)}`}
                  >

                    {/* 
                      flexRender permite renderizar:
                      - texto
                      - JSX
                      - funciones
                      definidos en columnDef.header
                    */}
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}

                  </th>

                ))}
              </tr>

            ))}

          </thead>

          {/* ================== CUERPO DE LA TABLA ================== */}
          <tbody className="bg-background text-text-primary">

            {/* Filas generadas por TanStack */}
            {table.getRowModel().rows.map(row => (

              <tr key={row.id} className="hover:bg-surface-muted text-text-primary">

                {/* Celdas visibles de cada fila */}
                {row.getVisibleCells().map(cell => (

                  <td
                    key={cell.id}
                    className={`px-3 lg:px-4 py-2 border-b border-border-strong text-text-primary ${responsiveClass(cell.column)}`}
                  >

                    {/* Render dinámico del contenido de la celda */}
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}

                  </td>

                ))}

              </tr>

            ))}

          </tbody>

        </table>
      </div>

      {/* ================== FOOTER ================== */}
      {/* En móvil se apila: el contador arriba y la paginación debajo (antes se salía de la tarjeta) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        {/* ================== INFORMACIÓN ================== */}
        {/* Cantidad de registros visibles */}
        <span className="text-sm text-text-primary">
          Mostrando {table.getRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} registros
        </span>

        {/* ================== CONTROLES DE PAGINACIÓN ================== */}
        {/* En móvil solo Anterior / "Página X de Y" / Siguiente; Inicio y Final desde sm */}
        <div className="flex items-center justify-between sm:justify-end gap-2">

          {/* Ir a la primera página */}
          <Button
            size="sm"
            variant="secondary"
            className="max-sm:hidden"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            Inicio
          </Button>

          {/* Página anterior */}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>

          {/* Información de página actual */}
          <span className="text-sm px-2 text-text-primary whitespace-nowrap" aria-live="polite">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {Math.max(table.getPageCount(), 1)}
          </span>

          {/* Página siguiente */}
          <Button
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>

          {/* Ir a la última página */}
          <Button
            size="sm"
            className="max-sm:hidden"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            Final
          </Button>

        </div>

      </div>

      {/* ================== IR A PÁGINA ================== */}
      {/* Permite navegar directamente a una página específica */}
      {/* Oculto en móvil: la paginación se reduce a Anterior / Siguiente */}
      <div className="hidden sm:flex items-center gap-2 text-sm text-text-primary">

        <span>Ir a página:</span>

        <input
          type="number"

          // Página actual (se muestra +1 porque el índice empieza en 0)
          defaultValue={table.getState().pagination.pageIndex + 1}

          onChange={(e) => {

            // Convierte el número ingresado en índice de página
            const page = e.target.value ? Number(e.target.value) - 1 : 0

            // Cambia la página
            table.setPageIndex(page)
          }}

          className="h-12 border border-border-strong rounded-shape-xs px-3 w-20 bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring"
        />

      </div>

    </div>
  )
}

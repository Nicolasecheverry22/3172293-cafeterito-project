import InvoiceRowActions from "../components/InvoiceRowActions";
import {
  formatCOP, formatDateTime, paymentMethodLabel, INVOICE_STATUS_STYLES,
} from "@/services/invoiceApi";

const STATUS_LABELS = { emitida: "Emitida", anulada: "Anulada" };

// El orden llega del backend (más recientes primero). meta.searchValue hace que el buscador
// encuentre lo que se ve (fecha formateada, "Efectivo", "Anulada") y no el valor crudo.
export const getInvoiceColumns = (onChanged) => [
  {
    accessorKey: "invoiceNumber",
    header: "Número",
    cell: ({ row }) => <span className="font-semibold whitespace-nowrap">{row.original.invoiceNumber}</span>,
  },
  {
    accessorKey: "createdAt",
    header: "Fecha/hora",
    meta: { hideBelow: "md", searchValue: (row) => formatDateTime(row.createdAt) },
    cell: ({ row }) => <span className="whitespace-nowrap">{formatDateTime(row.original.createdAt)}</span>,
  },
  {
    accessorKey: "tableNumber",
    header: "Mesa",
    meta: { hideBelow: "lg" },
  },
  {
    accessorKey: "cashier",
    header: "Cajero",
    meta: { hideBelow: "xl" },
  },
  {
    accessorKey: "paymentMethod",
    header: "Método",
    meta: { hideBelow: "md", searchValue: (row) => paymentMethodLabel(row.paymentMethod) },
    cell: ({ row }) => paymentMethodLabel(row.original.paymentMethod),
  },
  {
    accessorKey: "total",
    header: "Total",
    meta: { searchValue: (row) => formatCOP(row.total) },
    cell: ({ row }) => <span className="whitespace-nowrap">{formatCOP(row.original.total)}</span>,
  },
  {
    accessorKey: "status",
    header: "Estado",
    meta: { searchValue: (row) => STATUS_LABELS[row.status] ?? row.status },
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
          INVOICE_STATUS_STYLES[row.original.status] ?? "bg-surface-muted text-text-primary border-border"
        }`}
      >
        {STATUS_LABELS[row.original.status] ?? row.original.status}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <InvoiceRowActions invoice={row.original} onChanged={onChanged} />,
  },
];

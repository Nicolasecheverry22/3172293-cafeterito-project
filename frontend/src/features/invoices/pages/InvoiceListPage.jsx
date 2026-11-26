import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { DataTable, Button, Input, Select } from "@/shared";
import { getInvoices, PAYMENT_METHODS, INVOICE_STATUSES } from "@/services/invoiceApi";
import { getInvoiceColumns } from "../table/InvoiceColumns";
import ReportConfigModal from "../reports/ReportConfigModal";
import usePermission from "@/shared/hooks/usePermission";

const EMPTY_FILTERS = { from: "", to: "", paymentMethod: "", status: "" };

export default function InvoiceListPage() {
  const { guard } = usePermission();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [invoices, setInvoices] = useState([]);
  const [loadError, setLoadError] = useState(null);
  // "Reporte de ventas" del tablero llega con state.openReport: abre el modal directamente
  const location = useLocation();
  const [isReportOpen, setIsReportOpen] = useState(() => Boolean(location.state?.openReport));

  // Los filtros se envían al backend; el buscador del DataTable filtra lo ya cargado
  const loadInvoices = useCallback(() => {
    getInvoices(filters)
      .then((data) => {
        setInvoices(data);
        setLoadError(null);
      })
      .catch((err) => setLoadError(err.message));
  }, [filters]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const columns = useMemo(() => getInvoiceColumns(loadInvoices), [loadInvoices]);

  const setFilter = (e) => setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const rangeError = filters.from && filters.to && filters.from > filters.to
    ? "La fecha inicial no puede ser posterior a la final"
    : null;
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="w-full">
      <div className="bg-surface/40 dark:bg-surface/80 backdrop-blur-md rounded-shape-xl p-4 sm:p-6 md:p-8 border border-border/40 shadow-elevation-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold font-heading text-text-primary">Comprobantes de venta</h1>
            <p className="text-small text-text-secondary">Documentos sin validez fiscal</p>
          </div>
          {/* Móvil: botones apilados a ancho completo; desde sm, centrados en fila */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto *:w-full sm:*:w-auto">
            <Button
              size="md"
              variant="warm"
              onClick={() => setIsReportOpen(true)}
              {...guard("report_invoice", "generar reportes de comprobantes")}
            >
              Reportar comprobantes
            </Button>
          </div>
        </div>

        {/* Filtros enviados al backend */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6 items-end">
          <Input label="Desde" htmlFor="invoice-from" name="from" type="date" value={filters.from} onChange={setFilter} max={filters.to || undefined} />
          <Input label="Hasta" htmlFor="invoice-to" name="to" type="date" value={filters.to} onChange={setFilter} min={filters.from || undefined} error={rangeError} />
          <Select label="Método de pago" htmlFor="invoice-method" name="paymentMethod" value={filters.paymentMethod} onChange={setFilter} options={PAYMENT_METHODS} />
          <Select label="Estado" htmlFor="invoice-status" name="status" value={filters.status} onChange={setFilter} options={INVOICE_STATUSES} />
          <Button variant="secondary" size="md" className="h-12" onClick={() => setFilters(EMPTY_FILTERS)} disabled={!hasFilters}>
            Limpiar filtros
          </Button>
        </div>

        {loadError && (
          <p className="text-error text-small mb-4">No se pudieron cargar los comprobantes: {loadError}</p>
        )}

        <div className="min-w-0 bg-surface/0 shadow-elevation-1">
          <DataTable data={invoices} columns={columns} />
        </div>

        <ReportConfigModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} filters={filters} />
      </div>
    </div>
  );
}

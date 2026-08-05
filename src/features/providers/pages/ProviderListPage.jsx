import { useState } from "react";
import { DataTable } from "@/shared";
import { ProviderColumns } from "../table/ProviderColumns";
import { providers } from "../data/providers";
import { Button } from "../../../shared";
import { Link } from "react-router-dom";
import Navbar from "../../../shared/layouts/Navbar";
import ReportConfigModal from "../reports/components/ReportConfigModal";

export default function ProviderListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <Navbar />
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">
            Listado de Proveedores
          </h1>

          <div className="flex gap-12">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsModalOpen(true)}
            >
              Reportar proveedor
            </Button>

            <Link to="/providerCreate">
              <Button size="sm" variant="secondary">
                Crear proveedor
              </Button>
            </Link>
          </div>
        </div>

        <DataTable data={providers} columns={ProviderColumns} />

        <ReportConfigModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
}
import { useState } from "react";
import { DataTable, Button } from "@/shared";
import Navbar from "../../../shared/layouts/Navbar";
import { Link } from "react-router-dom";
import { OrdensColumns } from "../table/OrdensColumns";
import { ordens } from "../data/ordens";
import ReportConfigModal from "../reports/components/ReportConfigModal";

export default function OrdenListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <Navbar/>
      <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Listado de Órdenes</h2>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsModalOpen(true)}
          >
            Reportar órdenes
          </Button>

          <Link to="/createorders">
          <Button size="sm" variant="secondary">
            Crear orden
          </Button>
          </Link>
        </div>
      </div>

      <DataTable data={ordens} columns={OrdensColumns} />

      <ReportConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
    </div>
  );
}
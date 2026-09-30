import { useState } from "react";
import { DataTable, Button } from "@/shared";
import { Link } from "react-router-dom";

import { InventoryColumns } from "../table/InventoryColumns";
import { inventory } from "../data/inventory";

import ReportConfigModal from "../reports/components/ReportConfigModal";

export default function InventoryListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">
            Listado de Inventario
          </h1>

          <div className="flex gap-12">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsModalOpen(true)}
            >
              Reportar inventario
            </Button>

            <Link to="/inventoryCreate">
              <Button size="sm" variant="secondary">
                Crear producto
              </Button>
            </Link>
          </div>
        </div>


        <DataTable
          data={inventory}
          columns={InventoryColumns}
        />


        <ReportConfigModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
}
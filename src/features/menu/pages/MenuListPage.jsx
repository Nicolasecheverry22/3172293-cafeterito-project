import { useState } from "react";
import { DataTable, Button } from "@/shared";
import { Link } from "react-router-dom";
import Navbar from "@/shared/layouts/Navbar";

import { MenuColumns } from "../table/MenuColumns";
import { menu } from "../data/menu";
import ReportConfigModal from "../reports/components/ReportConfigModal";

export default function MenuListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <Navbar />

      <div className="p-4">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Listado de Menú</h2>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsModalOpen(true)}
            >
              Reportar menú
            </Button>

            <Link to="/createMenu">
              <Button size="sm" variant="secondary">
                Crear platillo
              </Button>
            </Link>
          </div>
        </div>

        <DataTable data={menu} columns={MenuColumns} />

        <ReportConfigModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
}
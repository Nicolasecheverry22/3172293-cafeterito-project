// src/users/pages/UserListPage.js
import { useState } from "react";
import { DataTable } from "@/shared"
import { UserColumns } from "../table/UserColumns"
import { users } from "../data/users"
import { Button } from "../../../shared";
import { Link } from "react-router-dom";
import Navbar from "../../../shared/layouts/Navbar";
import ReportConfigModal from "../reports/components/ReportConfigModal";

export default function UserListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <Navbar/>
      <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Listado de Usuarios</h1>

        <div className="flex gap-12">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsModalOpen(true)}
          >
            Reportar usuario
          </Button>

          <Link to="/userCreate">
            <Button size="sm" variant="secondary">
              Crear usuario
            </Button>
          </Link>
        </div>
      </div>

      <DataTable data={users} columns={UserColumns} />

      <ReportConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Truck } from "lucide-react";
import { FormNavbar } from "@/shared";
import ProviderForm from "../components/ProviderForm";
import { getDocumentTypes } from "@/services/selectService";
import { providers as providersData } from "../data/providers";

export default function CreateProviderPage() {
  const navigate = useNavigate();
  const [documentTypes, setDocumentTypes] = useState([]);

  useEffect(() => {
    getDocumentTypes().then(setDocumentTypes).catch(() => setDocumentTypes([]));
  }, []);

  const handleCreateProvider = async (validatedData) => {
    const newProvider = { id: providersData.length + 1, ...validatedData };
    providersData.push(newProvider);
    console.log("Proveedor guardado:", newProvider);
    navigate(-1);
  };

  return (
    <div className="w-full min-h-screen bg-background pb-10">
      <FormNavbar />
      <div className="w-full max-w-6xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <Truck className="w-8 h-8 text-text-primary" />
          <h1 className="text-main font-heading font-bold text-text-primary">Registrar proveedor nuevo</h1>
        </div>

        <div className="bg-surface rounded-3xl p-8 shadow-sm">
          <ProviderForm
            mode="create"
            documentTypes={documentTypes}
            onSubmit={handleCreateProvider}
            onCancel={() => navigate(-1)}
          />
        </div>
      </div>
    </div>
  );
}
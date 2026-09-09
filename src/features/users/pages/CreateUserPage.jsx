import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { FormNavbar } from "@/shared";
import UserForm from "../components/UserForm";
import { getDocumentTypes } from "@/services/selectService";
import { users as usersData } from "../data/users";

export default function CreateUserPage() {
  const navigate = useNavigate();
  const [documentTypes, setDocumentTypes] = useState([]);

  useEffect(() => {
    getDocumentTypes().then(setDocumentTypes);
  }, []);

  const handleCreateUser = async (validatedData) => {
    const newUser = { id: usersData.length + 1, ...validatedData };
    usersData.push(newUser);
    console.log("Usuario guardado:", usersData);
    navigate(-1);
  };

  return (
    <div className="w-full min-h-screen bg-background pb-10">
      <FormNavbar />
      <div className="w-full max-w-6xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <UserPlus className="w-8 h-8 text-text-primary" />
          <h1 className="text-main font-heading font-bold text-text-primary">Registrar usuario</h1>
        </div>

        <div className="bg-surface rounded-3xl p-8 shadow-sm">
          <UserForm
            mode="create"
            documentTypes={documentTypes}
            onSubmit={handleCreateUser}
            onCancel={() => navigate(-1)}
          />
        </div>
      </div>
    </div>
  );
}
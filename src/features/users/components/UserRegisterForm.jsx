import { useState, useEffect } from "react";
import { Input, Select, Checkbox, Button, FileInput } from "@/shared";
import { getDocumentTypes } from "@/services/selectService";
import { useNavigate } from "react-router-dom";
import { userSchema } from "../schemas/userSchema";
import { User, Pencil } from "lucide-react";

export default function UserRegisterForm() {
    const navigate = useNavigate();

    const [errors, setErrors] = useState({});
    const [documentTypes, setDocumentTypes] = useState([]);

    const [formData, setFormData] = useState({
        userName: "",
        userEmail: "",
        userPhone: "",
        userDocumentTypes: "",
        userDocumentNumber: "",
        userPassword: "",
        userImage: [],
        isStaff: false,
        isActive: true,
        isSuperUser: false,
    });

    useEffect(() => {
        getDocumentTypes().then(setDocumentTypes);
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = userSchema.safeParse(formData);

        // ✅ VALIDACIÓN CORRECTA
        if (!result.success) {
            const fieldErrors = {};

            result.error.issues.forEach((issue) => {
                fieldErrors[issue.path[0]] = issue.message;
            });

            setErrors(fieldErrors);
            return;
        }

        setErrors({});

        try {
            await createUser(result.data);
            console.log("Usuario creado correctamente");
            navigate(-1);
        } catch (error) {
            console.error("Error:", error.message);
            alert(error.message);
        }
    };

    return (
        <div className="grid items-center justify-center">
            <h1 className="mx-auto my-12 text-title font-bold">
                Registro de usuarios
            </h1>

            <form className="grid gap-2" onSubmit={handleSubmit}>
                <Input
                    label="Nombre"
                    name="userName"
                    type="text"
                    value={formData.userName}
                    placeholder="Ingrese su nombre"
                    onChange={handleChange}
                    error={errors.userName}
                />

                <Input
                    label="Correo"
                    name="userEmail"
                    type="email"
                    value={formData.userEmail}
                    placeholder="Ingrese su correo"
                    onChange={handleChange}
                    error={errors.userEmail}
                />

                <Input
                    label="Teléfono"
                    name="userPhone"
                    type="tel"
                    value={formData.userPhone}
                    placeholder="Ingrese su número"
                    onChange={handleChange}
                    error={errors.userPhone}
                />

                <Select
                    label="Tipos de documento"
                    name="userDocumentTypes"
                    value={formData.userDocumentTypes}
                    options={documentTypes}
                    onChange={handleChange}
                    error={errors.userDocumentTypes}
                />

                <Input
                    label="Documento"
                    name="userDocumentNumber"
                    type="text"
                    value={formData.userDocumentNumber}
                    placeholder="Ingrese su documento"
                    onChange={handleChange}
                    error={errors.userDocumentNumber}
                />

                <Input
                    label="Contraseña"
                    name="userPassword"
                    type="password"
                    value={formData.userPassword}
                    placeholder="Ingrese su contraseña"
                    onChange={handleChange}
                    error={errors.userPassword}
                />

                {/* CHECKBOX */}
                <div className="grid gap-4 my-4">
                    <Checkbox
                        name="isSuperUser"
                        label="Es super usuario"
                        checked={formData.isSuperUser}
                        onChange={handleChange}
                    />

                    <Checkbox
                        name="isStaff"
                        label="Es staff"
                        checked={formData.isStaff}
                        onChange={handleChange}
                    />

                    <Checkbox
                        name="isActive"
                        label="Está activo"
                        checked={formData.isActive}
                        onChange={handleChange}
                    />
                </div>

                <h2>Cantidad Máxima: 12 archivos</h2>
                <h2>Peso Máximo: 10MB</h2>

                <FileInput
                    value={formData.userImage}
                    onChange={(files) =>
                        setFormData((prev) => ({
                            ...prev,
                            userImage: files,
                        }))
                    }
                    multiple
                />

                {errors.userImage && (
                    <span className="text-red-500 text-sm">
                        {errors.userImage}
                    </span>
                )}

                {/* BOTONES */}
                <div className="flex gap-6 items-center">
                    <Button
                        variant="secondary"
                        size="sm"
                        type="button"
                        onClick={() => navigate(-1)}
                    >
                        Cancelar
                    </Button>

                    <Button
                        variant="primary"
                        size="md"
                        type="submit"
                    >
                        Guardar
                    </Button>
                </div>

                <User />
                <Pencil />
            </form>
        </div>
    );
}
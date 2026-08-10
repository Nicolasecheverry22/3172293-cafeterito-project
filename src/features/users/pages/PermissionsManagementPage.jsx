import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, ChevronDown } from "lucide-react";
import { Button, Checkbox, FormNavbar } from "@/shared";

export default function PermissionsManagementPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        master_usuarios: false,
        usr_crear: false, 
        usr_visualizar: false,
         usr_actualizar: false, 
         usr_listar: false,
          usr_activar: false, 
          usr_reporte: false,
        
        master_consumo: false,
        cons_crear: false,
         cons_visualizar: false, 
         cons_actualizar: false,
          cons_listar: false, 
          cons_activar: false, 
          cons_reporte: false,
        
        master_devolutivo: false,
        dev_crear: false, 
        dev_visualizar: false,
         dev_actualizar: false, 
         dev_listar: false,
          dev_activar: false,
           dev_reporte: false,
        
        master_prestamos: false,
        pres_crear: false,
         pres_visualizar: false, 
         pres_actualizar: false,
          pres_listar: false, 
          pres_activar: false, 
          pres_reporte: false,
           pres_retornar: false,
            pres_aprobar: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Datos de permisos listos para enviar:", formData);
    };

    return (
        <div className="w-full min-h-screen bg-background pb-10">
            <FormNavbar />
            
            <div className="w-full px-6 md:px-12 pt-8">
                <div className=" mx-auto">
                    
                    {/* Encabezado */}
                    <div className="flex items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-display font-heading font-bold text-text-primary flex items-center gap-3">
                                Gestión de Permisos
                            </h1>
                            <p className="text-body text-text-secondary mt-1">
                                Asignación de roles y accesos al sistema.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        
                        <div className="lg:col-span-1 flex flex-col gap-10 mt-4">
                            
                            <div className="flex flex-col gap-2 relative">
                                <label className="text-body text-text-primary font-bold border-b border-border-strong pb-1 w-full text-center mx-auto max-w-[80%]">
                                    Grupos usuarios
                                </label>
                                <div className="relative mt-2">
                                    <select className="w-full appearance-none bg-brand text-text-primary h-12 px-6 rounded-full font-bold outline-none cursor-pointer shadow-md hover:brightness-95 transition-all">
                                        <option value="">Grupo usuarios</option>
                                        <option value="admin">Administradores</option>
                                        <option value="instructor">Meseros</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-primary pointer-events-none" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 relative">
                                <label className="text-body text-text-primary font-bold border-b border-border-strong pb-1 w-full text-center mx-auto max-w-[80%]">
                                    Usuario individual
                                </label>
                                <div className="relative mt-2">
                                    <select className="w-full appearance-none bg-brand text-text-primary h-12 px-6 rounded-full font-bold outline-none cursor-pointer shadow-md hover:brightness-95 transition-all">
                                        <option value="">Seleccione Usuario</option>
                                        <option value="user1">Carlos</option>
                                        <option value="user2">nicolas</option>
                                        <option value="user2">miguel</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-primary pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-3 bg-surface-muted/50 rounded-2xl p-8 md:p-10 shadow-inner border border-border">
                            
                            <div className="mb-8 border-b border-border-strong pb-6">
                                <div className="mb-4">
                                    <Checkbox id="master_usuarios" name="master_usuarios" checked={formData.master_usuarios} onChange={handleChange}
                                    label={<span className="font-heading font-bold text-lg text-text-primary">Gestión Usuarios</span>} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-y-4 gap-x-2 pl-2">
                                    <Checkbox id="usr_crear"
                                     name="usr_crear"
                                      label="Crear usuario"
                                       checked={formData.usr_crear}
                                     onChange={handleChange} />
                                    <Checkbox
                                     id="usr_visualizar" 
                                     name="usr_visualizar" 
                                     label="Visualizar usuarios" 
                                     checked={formData.usr_visualizar} 
                                     onChange={handleChange} />
                                    <Checkbox 
                                    id="usr_actualizar" 
                                    name="usr_actualizar" 
                                    label="Actualizar usuario" 
                                    checked={formData.usr_actualizar} 
                                    onChange={handleChange} />
                                    <Checkbox 
                                    id="usr_listar" 
                                    name="usr_listar" 
                                    label="Listar usuarios"
                                     checked={formData.usr_listar} 
                                     onChange={handleChange} />
                                    <Checkbox 
                                    id="usr_activar" 
                                    name="usr_activar" 
                                    label="Activar/Desactivar usuarios" 
                                    checked={formData.usr_activar} 
                                    onChange={handleChange} />
                                    <Checkbox 
                                    id="usr_reporte" 
                                    name="usr_reporte" 
                                    label="Generar reporte usuarios" 
                                    checked={formData.usr_reporte} 
                                    onChange={handleChange} />
                                </div>
                            </div>

                            <div className="mb-8 border-b border-border-strong pb-6">
                                <div className="mb-4">
                                    <Checkbox 
                                    id="master_consumo" 
                                    name="master_consumo" 
                                    checked={formData.master_consumo} 
                                    onChange={handleChange}
                                    label={<span className="font-heading font-bold text-lg text-text-primary">Gestión material de consumo</span>} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-y-4 gap-x-2 pl-2">
                                    <Checkbox 
                                    id="cons_crear" 
                                    name="cons_crear" 
                                    label="Crear material de consumo" 
                                    checked={formData.cons_crear} 
                                    onChange={handleChange} />
                                    <Checkbox 
                                    id="cons_visualizar" 
                                    name="cons_visualizar" 
                                    label="Visualizar material consumo" 
                                    checked={formData.cons_visualizar} 
                                    onChange={handleChange} />
                                    <Checkbox 
                                    id="cons_actualizar" 
                                    name="cons_actualizar" 
                                    label="Actualizar material de consumo" 
                                    checked={formData.cons_actualizar} 
                                    onChange={handleChange} />
                                    <Checkbox 
                                    id="cons_listar" 
                                    name="cons_listar" 
                                    label="Listar material de consumo" 
                                    checked={formData.cons_listar} 
                                    onChange={handleChange} />
                                    <Checkbox 
                                    id="cons_activar" 
                                    name="cons_activar" 
                                    label="Activar/Desactivar material de consumo" 
                                    checked={formData.cons_activar} 
                                    onChange={handleChange} />
                                    <Checkbox 
                                    id="cons_reporte" 
                                    name="cons_reporte" 
                                    label="Generar reporte material de consumo" checked={formData.cons_reporte} 
                                    onChange={handleChange} />
                                </div>
                            </div>

                            <div className="mb-8 border-b border-border-strong pb-6">
                                <div className="mb-4">
                                    <Checkbox 
                                    id="master_devolutivo" 
                                    name="master_devolutivo" 
                                    checked={formData.master_devolutivo} 
                                    onChange={handleChange}
                                    
                                    label={<span className="font-heading font-bold text-lg text-text-primary">Gestión material devolutivo</span>} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-y-4 gap-x-2 pl-2">
                                    <Checkbox id="dev_crear" name="dev_crear" label="Crear material devolutivo" checked={formData.dev_crear} onChange={handleChange} />
                                    <Checkbox 
                                    id="dev_visualizar" 
                                    name="dev_visualizar" 
                                    label="Visualizar material devolutivo" 
                                    checked={formData.dev_visualizar} 
                                    onChange={handleChange} />
                                    <Checkbox 
                                    id="dev_actualizar" 
                                    name="dev_actualizar" 
                                    label="Actualizar material devolutivo" 
                                    checked={formData.dev_actualizar} 
                                    onChange={handleChange} />
                                    <Checkbox 
                                    id="dev_listar" 
                                    name="dev_listar" 
                                    label="Listar material devolutivo" 
                                    checked={formData.dev_listar} 
                                    onChange={handleChange} />
                                    <Checkbox  
                                    id="dev_activar" 
                                    name="dev_activar" 
                                    label="Activar/Desactivar material devolutivo" 
                                    checked={formData.dev_activar} 
                                    onChange={handleChange} />
                                    <Checkbox 
                                    id="dev_reporte" 
                                    name="dev_reporte" 
                                    label="Generar reporte material devolutivo" 
                                    checked={formData.dev_reporte} 
                                    onChange={handleChange} />
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="mb-4">
                                    <Checkbox 
                                    id="master_prestamos" 
                                    name="master_prestamos" 
                                    checked={formData.master_prestamos} 
                                    onChange={handleChange}
                                    label={<span 
                                    className="font-heading font-bold text-lg text-text-primary">Gestión préstamos</span>} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-y-4 gap-x-2 pl-2">
                                    <Checkbox 
                                    id="pres_crear" 
                                    name="pres_crear" 
                                    label="Crear préstamo" 
                                    checked={formData.pres_crear} 
                                    onChange={handleChange} />
                                    <Checkbox 
                                    id="pres_visualizar" 
                                    name="pres_visualizar" 
                                    label="Visualizar préstamo" 
                                    checked={formData.pres_visualizar} 
                                    onChange={handleChange} />
                                    <Checkbox 
                                    id="pres_actualizar" 
                                    name="pres_actualizar" 
                                    label="Actualizar préstamo" 
                                    checked={formData.pres_actualizar} 
                                    onChange={handleChange} />
                                    <Checkbox 
                                    id="pres_listar" 
                                    name="pres_listar" 
                                    label="Listar préstamos" checked={formData.pres_listar} 
                                    onChange={handleChange} />
                                    <Checkbox 
                                    id="pres_activar" 
                                    name="pres_activar" 
                                    label="Activar/Desactivar préstamo" 
                                    checked={formData.pres_activar} 
                                    onChange={handleChange} />
                                    <Checkbox 
                                    id="pres_reporte" 
                                    name="pres_reporte" 
                                    label="Generar reporte préstamos" 
                                    checked={formData.pres_reporte} 
                                    onChange={handleChange} />
                                    <Checkbox 
                                    id="pres_retornar" 
                                    name="pres_retornar" 
                                    label="Retornar préstamos" 
                                    checked={formData.pres_retornar} 
                                    onChange={handleChange} />
                                    <Checkbox 
                                    id="pres_aprobar" 
                                    name="pres_aprobar" 
                                    label="Aprobar retorno préstamos" 
                                    checked={formData.pres_aprobar} 
                                    onChange={handleChange} />
                                </div>
                            </div>

                        </div>

                        <div className="lg:col-span-4 mt-6 flex justify-end gap-4 border-t border-border pt-6">
                            <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
                                Cancelar
                            </Button>
                            <Button variant="primary" type="submit" className="flex items-center gap-2">
                                <Save className="w-5 h-5" />
                                Guardar Cambios
                            </Button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
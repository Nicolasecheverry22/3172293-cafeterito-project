import { useState } from "react";
import { Utensils } from "lucide-react";
import { FormNavbar, Input, Select, Button, FileInput } from "@/shared"; 

export default function CreateMenuPage() {
    const [formData, setFormData] = useState({
        nombre: "",
        precio: "",
        categoria: "",
        descripcion: "",
        estado: true, 
        imagen: [],   
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
        console.log("Datos del platillo a registrar:", formData);
    };

    return (
        <div className="w-full min-h-screen bg-background pb-12">
            <FormNavbar />
            
            <div className="w-full px-6 md:px-12 pt-10">
                <div className=" mx-auto">
                    
                    <div className="flex items-center gap-4 mb-12">
                        <Utensils className="w-10 h-10 text-text-primary" />
                        <h1 className="text-display font-heading font-bold text-text-primary">
                            Registrar nuevo platillo
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                        
                        <div className="w-full lg:w-1/3 flex flex-col items-center gap-8 pt-2">
                            
                            <FileInput 
                                value={formData.imagen}
                                onChange={(files) => setFormData(prev => ({ ...prev, imagen: files }))}
                                multiple={false}
                                accept="image/*"
                            />

                            <div className="flex items-center gap-4 mt-2">
                                <span className="font-bold text-text-primary text-body">Estado</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        name="estado"
                                        className="sr-only peer" 
                                        checked={formData.estado}
                                        onChange={handleChange}
                                    />
                                    <div className="w-16 h-8 bg-surface border border-border rounded-full peer peer-checked:bg-brand transition-colors relative">
                                        <div className="absolute top-1 left-1 w-6 h-6 bg-background border border-border rounded-full transition-transform peer-checked:translate-x-8"></div>
                                        <span className="absolute right-2 top-1.5 text-xs font-bold text-text-primary opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">
                                            Activo
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="w-full lg:w-2/3 flex flex-col justify-between">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                
                                <Input 
                                    label="Nombre del platillo"
                                    name="nombre"
                                    htmlFor="nombre"
                                    placeholder="Ingrese nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                />
                                
                                <Input 
                                    label="Precio"
                                    name="precio"
                                    htmlFor="precio"
                                    type="number"
                                    placeholder="Ingrese precio"
                                    value={formData.precio}
                                    onChange={handleChange}
                                />

                                <Select 
                                    label="Categoría"
                                    name="categoria"
                                    htmlFor="categoria"
                                    value={formData.categoria}
                                    onChange={handleChange}
                                    options={[
                                        { value: "entradas", label: "Entradas" },
                                        { value: "plato_fuerte", label: "Plato Fuerte" },
                                        { value: "bebidas", label: "Bebidas" },
                                        { value: "postres", label: "Postres" },
                                    ]}
                                />

                                <Input 
                                    label="Descripción"
                                    name="descripcion"
                                    htmlFor="descripcion"
                                    placeholder="Ingrese descripción"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="flex justify-end mt-12 pt-6">
                                <Button type="submit" variant="primary" className="w-full md:w-auto px-14 font-bold shadow-sm">
                                    Registrar
                                </Button>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
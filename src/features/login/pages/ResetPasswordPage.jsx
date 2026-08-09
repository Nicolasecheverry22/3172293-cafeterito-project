import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Input, Button } from "@/shared";

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    
    const [passwords, setPasswords] = useState({
        newPassword: "",
        confirmPassword: ""
    });

    const handleChange = (e) => {
        setPasswords({
            ...passwords,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (passwords.newPassword !== passwords.confirmPassword) {
            console.error("Las contraseñas no coinciden");
            return;
        }

        console.log("Contraseña actualizada exitosamente");
        navigate("/auth"); 
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-surface-muted/30">
                        <div className="w-full max-w-3xl bg-background rounded-2xl shadow-xl overflow-hidden relative p-8 md:p-16 flex flex-col items-center justify-center min-h-[500px]">

            <button 
                    onClick={() => navigate(-1)}
                    className="absolute top-6 left-6 p-2 text-text-primary hover:text-brand transition-colors z-10 cursor-pointer"
                    aria-label="Volver"
                >
                    <ArrowLeft className="w-8 h-8 stroke-[2.5]" />
                </button>
                
                <div className="w-full max-w-md flex flex-col items-center text-center">
                    
                    <h2 className="text-display font-heading font-bold text-text-primary mb-4">
                        Cambiar contraseña
                    </h2>
                    
                    <p className="text-body text-text-secondary mb-10">
                        Escriba su nueva contraseña
                    </p>

                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
                        <Input 
                            type="password" 
                            name="newPassword"
                            placeholder="Ingrese su contraseña nueva" 
                            value={passwords.newPassword}
                            onChange={handleChange}
                            required 
                        />

                        <Input 
                            type="password" 
                            name="confirmPassword"
                            placeholder="Confirme su contraseña nueva" 
                            value={passwords.confirmPassword}
                            onChange={handleChange}
                            required 
                        />

                        <div className="flex justify-center mt-4 w-full">
                            <Button variant="primary" type="submit" size="md">
                                Cambiar Contraseña
                            </Button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
}
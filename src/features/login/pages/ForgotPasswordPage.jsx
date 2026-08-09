import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Input, Button } from "@/shared";
import imageLogin from "@/assets/images/image-login.png"; 
import { forgotPasswordSchema } from "../schemas/forgotPasswordSchema";

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({ email: "" });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const result = forgotPasswordSchema.safeParse(formData);

        if (!result.success) {
            const fieldErrors = {};

            result.error.issues.forEach((issue) => {
                fieldErrors[issue.path[0]] = issue.message;
            });

            setErrors(fieldErrors);
            return; 
        }

 
        setErrors({});
        navigate("/auth/verifyToken"); 
    };

    return (
        <div className="flex flex-col md:flex-row w-full max-w-5xl bg-background rounded-2xl shadow-xl overflow-hidden relative">
            
            <button 
                type="button"
                onClick={() => navigate(-1)}
                className="absolute top-6 left-6 p-2 text-text-primary hover:text-brand transition-colors z-10 cursor-pointer"
                aria-label="Volver"
            >
                <ArrowLeft className="w-8 h-8 stroke-[2.5]" />
            </button>

            <div className="hidden md:flex md:w-1/2 items-center justify-center p-8 bg-surface-muted/10">
                <div className="w-full max-w-sm flex justify-center">
                    <img 
                        src={imageLogin} 
                        className="w-full h-auto object-contain" 
                        alt="Recuperar contraseña"
                    />
                </div>
            </div>

            <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-16 bg-background">
                
                <h2 className="text-display font-heading font-bold text-text-primary mb-4">
                    ¿Olvidaste tu contraseña?
                </h2>
                
                <p className="text-body text-text-secondary mb-10 pr-4">
                    Ingresa tu dirección de correo electrónico para restablecer una nueva contraseña.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1">
                        <Input 
                            type="email" 
                            name="email" 
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Ingresa tu correo electrónico" 
                        />
                        {errors.email && (
                            <span className="text-xs text-red-500 font-medium ml-1">
                                {errors.email}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-4 mt-4">
                        <Button variant="primary" type="submit" size="md">
                            Continuar
                        </Button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-small text-text-muted">
                        ¿Recordaste tu contraseña?{" "}
                        <span 
                            onClick={() => navigate("/auth")} 
                            className="text-text-primary font-bold cursor-pointer hover:underline"
                        >
                            Iniciar sesión
                        </span>
                    </p>
                </div>

            </div>
        </div>
    );
}
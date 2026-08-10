import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Input, Button } from "@/shared";
import imageLogin from "@/assets/images/image-login.png"; 

export default function ForgotPasswordPage() {
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Enviando enlace de recuperación...");
        navigate("/auth/verifyToken");
    };

    return (
       
            <div className="flex flex-col md:flex-row w-full max-w-5xl bg-background rounded-2xl shadow-xl overflow-hidden ">
                

                <div className="hidden md:flex md:w-1/2 relative items-center justify-center p-8 bg-surface-muted/10">
                <button 
                    onClick={() => navigate(-1)}
                    className="absolute top-6 left-6 p-2 text-text-primary hover:text-brand transition-colors z-10 cursor-pointer"
                    aria-label="Volver"
                >
                    <ArrowLeft className="w-8 h-8 stroke-[2.5]" />
                </button>
                    <div className="w-full max-w-sm flex justify-center">
                        <img 
                            src={imageLogin} 
                            className="w-full h-auto object-contain" 
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
                        <Input 
                            type="email" 
                            placeholder="Ingresa tu correo electrónico" 
                            required 
                        />

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
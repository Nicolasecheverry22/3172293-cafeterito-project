import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Input, Button } from "@/shared";

export default function VerifyTokenPage() {
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Validando token...");
        navigate("/auth/newPassword");
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
                        Enviamos un token a tu correo
                    </h2>
                    
                    <p className="text-body text-text-secondary mb-10">
                        Ingresa el código más reciente que te enviamos a tu correo:
                    </p>

                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8">
                        <Input 
                            type="text" 
                            placeholder="Ingrese su token" 
                            required 
                            className="text-center tracking-widest" 
                        />

                        <div className="flex justify-center mt-2 w-full">
                            <Button variant="primary" type="submit" size="md">
                                Continuar
                            </Button>
                        </div>
                    </form>

                    <div className="mt-10 flex flex-col items-center gap-2">
                        <p className="text-small text-text-muted">
                            ¿No recibiste el código?
                        </p>
                        
                        <button 
                            type="button"
                            className="text-small text-text-primary font-bold cursor-pointer hover:underline focus:outline-none"
                            onClick={() => console.log("Solicitando nuevo código...")}
                        >
                            Solicitar un nuevo código
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
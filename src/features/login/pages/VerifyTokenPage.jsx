import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Input, Button } from "@/shared";
import { verifyTokenSchema } from "../schemas/verifyTokenSchema"; 

export default function VerifyTokenPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ token: "" });
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

  const result = verifyTokenSchema.safeParse(formData);

  if (!result.success) {
    const fieldErrors = {};
    result.error.issues.forEach((issue) => {
      fieldErrors[issue.path[0]] = issue.message;
    });
    setErrors(fieldErrors);
    return;
  }

  setErrors({});

  navigate(`/auth/newPassword?token=${result.data.token}`);
};

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-surface-muted/30">
            
            <div className="w-full max-w-3xl bg-background rounded-2xl shadow-xl overflow-hidden relative p-8 md:p-16 flex flex-col items-center justify-center ">
                
                <button 
                    type="button"
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
                        <div className="flex flex-col gap-1 text-left">
                            <Input 
                                type="text" 
                                name="token"
                                value={formData.token}
                                onChange={handleChange}
                                placeholder="Ingrese su token" 
                                className="text-center tracking-widest" 
                            />
                            {errors.token && (
                                <span className="text-xs text-red-500 font-medium ml-1 text-center">
                                    {errors.token}
                                </span>
                            )}
                        </div>

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
                            onClick={() => {}} 
                        >
                            Solicitar un nuevo código
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
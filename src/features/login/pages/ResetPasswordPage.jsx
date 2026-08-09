import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Input, Button } from "@/shared";
import { resetPasswordSchema } from "../schemas/resetPasswordSchema"; 

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    
    const [passwords, setPasswords] = useState({
        newPassword: "",
        confirmPassword: ""
    });
    
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setPasswords({
            ...passwords,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const result = resetPasswordSchema.safeParse(passwords);

        if (!result.success) {
            const fieldErrors = {};
            result.error.issues.forEach((issue) => {
                fieldErrors[issue.path[0]] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setErrors({});
        navigate("/auth"); 
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-surface-muted/30">
            
            <div className="w-full max-w-3xl bg-background rounded-2xl shadow-xl overflow-hidden p-8 md:p-16 flex flex-col items-center justify-center min-h-[500px]">
                
                <div className="w-full max-w-md flex flex-col items-center text-center">
                    
                    <h2 className="text-display font-heading font-bold text-text-primary mb-4">
                        Cambiar contraseña
                    </h2>
                    
                    <p className="text-body text-text-secondary mb-10">
                        Escriba su nueva contraseña
                    </p>

                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
                        
                        <div className="flex flex-col gap-1 text-left">
                            <Input 
                                type="password" 
                                name="newPassword"
                                placeholder="Ingrese su contraseña nueva" 
                                value={passwords.newPassword}
                                onChange={handleChange}
                            />
                            {errors.newPassword && (
                                <span className="text-xs text-red-500 font-medium ml-1">
                                    {errors.newPassword}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col gap-1 text-left">
                            <Input 
                                type="password" 
                                name="confirmPassword"
                                placeholder="Confirme su contraseña nueva" 
                                value={passwords.confirmPassword}
                                onChange={handleChange}
                            />
                            {errors.confirmPassword && (
                                <span className="text-xs text-red-500 font-medium ml-1">
                                    {errors.confirmPassword}
                                </span>
                            )}
                        </div>

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
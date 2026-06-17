import { useState } from "react";
import { Input, Checkbox, Button } from "@/shared"; 
import { Link, useNavigate } from "react-router-dom";
import { loginSchema } from "../schemas/loginSchema";
import imageLogin from "@/assets/images/image-login.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = loginSchema.safeParse(formData);

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
      console.log("Datos de login validados:", result.data);
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-background rounded-2xl shadow-xl overflow-hidden min-h-[600px] relative">
        
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 text-main font-heading text-text-secondary hover:text-text-primary transition-colors"
        >
        </button>

        {/*columna izquierda*/}
        <div className="hidden md:flex md:w-1/2 items-center justify-center p-8">
          <div className="w-full max-w-sm flex justify-center">
            <img src={imageLogin} alt="Ilustración de login" className="w-full h-auto object-contain" />
          </div>
        </div>

        {/*columna derecha*/}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-16">
          
          <h2 className="text-display font-heading text-text-primary mb-1">
            Te damos la Bienvenida
          </h2>
          
          <p className="text-body text-text-secondary mb-8">
            Inicia sesión<br />
            Y disfruta la experiencia
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              name="username"
              type="text"
              placeholder="Ingrese su usuario"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
            />
            
            <Input
              name="password"
              type="password"
              placeholder="Ingrese su contraseña"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />

            <div className="flex items-center ">
              <Checkbox
                name="rememberMe"
                label="Recordarme"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-4 mt-4">
              <Button variant="primary" type="submit" size="md">
                Iniciar Sesión
              </Button>
              
              <Button 
                variant="secondary" 
                type="button" 
                size="md"
                // Hay que ajustar esta ruta cuadno julian cree el regiztro
                onClick={() => navigate("/auth/registro")} 
              >
                Crear una Cuenta
              </Button>
            </div>

            <div className="text-center mt-6">
              <Link 
                to="/auth/recuperar-password" 
                className="text-small text-text-muted hover:text-text-primary hover:underline transition-colors"
              >
                Olvidé mi contraseña
              </Link>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
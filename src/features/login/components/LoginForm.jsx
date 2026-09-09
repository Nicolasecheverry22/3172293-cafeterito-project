import { useState } from "react";
import { Input, Checkbox, Button } from "@/shared";
import { Link } from "react-router-dom";
import { loginSchema } from "../schemas/loginSchema";

const MAX_LOGIN_ATTEMPTS = 3;

export default function LoginForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;

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
    setIsSubmitting(true);

    try {
      await onSubmit(result.data);
      setFailedAttempts(0); 
    } catch (error) {
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);

      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        setIsLocked(true);
        setErrors({ form: "Cuenta bloqueada por 3 intentos fallidos consecutivos." });
      } else {
        setErrors({ form: error.message || "Usuario o contraseña incorrectos." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        name="username"
        type="text"
        placeholder="Ingrese su usuario"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
        disabled={isLocked}
      />

      <Input
        name="password"
        type="password"
        placeholder="Ingrese su contraseña"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        disabled={isLocked}
      />

      {errors.form && (
        <p className="text-small text-red-500" role="alert">
          {errors.form}
        </p>
      )}

      <div className="flex items-center">
        <Checkbox
          name="rememberMe"
          label="Recordarme"
          checked={formData.rememberMe}
          onChange={handleChange}
          disabled={isLocked}
        />
      </div>

      <div className="flex flex-col gap-4 mt-4">
        <Button variant="primary" type="submit" size="md" disabled={isLocked || isSubmitting}>
          {isSubmitting ? "Validando..." : "Iniciar Sesión"}
        </Button>
      </div>

      <div className="text-center mt-6">
        <Link
          to="/auth/recoverPassword"
          className="text-small text-text-muted hover:text-text-primary hover:underline transition-colors"
        >
          Olvidé mi contraseña
        </Link>
      </div>
    </form>
  );
}
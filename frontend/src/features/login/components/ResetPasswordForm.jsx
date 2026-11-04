import { useState } from "react";
import { Input, Button } from "@/shared";
import { resetPasswordSchema } from "../schemas/resetPasswordSchema";

export default function ResetPasswordForm({ onSubmit }) {
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
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
    setIsSubmitting(true);
    try {
      await onSubmit(result.data.newPassword);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-left">
        <Input
          type="password"
          name="newPassword"
          placeholder="Ingrese su contraseña nueva"
          value={passwords.newPassword}
          onChange={handleChange}
          disabled={isSubmitting}
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
          disabled={isSubmitting}
        />
        {errors.confirmPassword && (
          <span className="text-xs text-red-500 font-medium ml-1">
            {errors.confirmPassword}
          </span>
        )}
      </div>

      <div className="flex justify-center mt-4 w-full">
        <Button variant="primary" type="submit" size="md" disabled={isSubmitting}>
          {isSubmitting ? "Cambiando..." : "Cambiar Contraseña"}
        </Button>
      </div>
    </form>
  );
}
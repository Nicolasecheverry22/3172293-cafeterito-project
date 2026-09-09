import { useState } from "react";
import { Input, Button } from "@/shared";
import { forgotPasswordSchema } from "../schemas/forgotPasswordSchema";

export default function ForgotPasswordForm({ onSubmit }) {
  const [formData, setFormData] = useState({ email: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
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
    setIsSubmitting(true);
    try {
      await onSubmit(result.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Ingresa tu correo electrónico"
          disabled={isSubmitting}
        />
        {errors.email && (
          <span className="text-xs text-red-500 font-medium ml-1">
            {errors.email}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4 mt-4">
        <Button variant="primary" type="submit" size="md" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Continuar"}
        </Button>
      </div>
    </form>
  );
}
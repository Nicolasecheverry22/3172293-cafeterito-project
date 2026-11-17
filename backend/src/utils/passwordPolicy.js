export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 64;

export const PASSWORD_RULES = [
  { regex: /[a-z]/, name: "minúscula", message: "debe contener al menos una letra minúscula" },
  { regex: /[A-Z]/, name: "mayúscula", message: "debe contener al menos una letra mayúscula" },
  { regex: /\d/, name: "número", message: "debe contener al menos un número" },
  { regex: /[^A-Za-z0-9\s]/, name: "símbolo", message: "debe contener al menos un símbolo" },
];

// Devuelve la lista de incumplimientos (vacía si la contraseña es válida).
export function passwordProblems(password) {
  if (typeof password !== "string") return ["la contraseña es obligatoria"];
  const problems = [];
  if (password.length < PASSWORD_MIN) problems.push(`debe tener al menos ${PASSWORD_MIN} caracteres`);
  if (password.length > PASSWORD_MAX) problems.push(`debe tener máximo ${PASSWORD_MAX} caracteres`);
  for (const rule of PASSWORD_RULES) {
    if (!rule.regex.test(password)) problems.push(rule.message);
  }
  return problems;
}

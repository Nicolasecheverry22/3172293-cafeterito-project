export function buildReportDataset({
  users,
  selectedFields,
  scope,
  documentNumber
}) {
  let filteredUsers = [...users];

  if (scope === "document" && documentNumber) {
    filteredUsers = filteredUsers.filter(
      (user) => String(user.userDocument) === String(documentNumber).trim()
    );
  }

  const headers = selectedFields.map((field) => field.label);

  const rows = filteredUsers.map((user) =>
    selectedFields.map((field) => {
      const value = user[field.key];

      // Formato para el Estado
      if (field.key === "is_active") {
        return value === true || value === "Activo" ? "Activo" : "Inactivo";
      }

      // Formato para los Roles (si vienen en array de PostgreSQL)
      if (field.key === "groups") {
        if (Array.isArray(value)) {
          return value.join(", ");
        }
        return value ?? "";
      }

      // Normalización para los demás campos
      return value ?? "";
    })
  );

  return {
    headers,
    rows
  };
}
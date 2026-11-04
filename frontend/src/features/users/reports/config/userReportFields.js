//modifique las key ya que no coincidiancon users.js de src/features/users/data/users.js  (sin la mofificacion no no encuentra los datos de usuarios ya que las keys no coinciden y por lo tanto lo deja "")

export const userReportFields = [
  {
    key: "userName",
    label: "Nombre",
    default: true
  },
  {
    key: "userEmail",
    label: "Email",
    default: true
  },
  {
    key: "userPhone",
    label: "Teléfono",
    default: true
  },
  {
    key: "is_active",
    label: "Estado",
    default: true
  }
];
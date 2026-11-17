import { clearSession } from "@/services/apiClient";

export function logout() {
  clearSession();
  window.location.replace("/auth");
}

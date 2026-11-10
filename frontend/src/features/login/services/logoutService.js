export function logout() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.location.replace("/auth");
}
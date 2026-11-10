const API_URL = "http://localhost:4000/api";
const AUTH_API_URL = `${API_URL}/auth`;

export async function login(userData) {
  const response = await fetch(`${AUTH_API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: userData.userEmail,    
      password: userData.userPassword, 
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "Error al iniciar sesión");
  }

  if (data.token) {
    sessionStorage.setItem("token", data.token);
  }
  if (data.user) {
    sessionStorage.setItem("user", JSON.stringify(data.user));
  }

  return data;
}
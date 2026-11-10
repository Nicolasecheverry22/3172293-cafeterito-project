import LoginForm from "../components/LoginForm";
import { login as loginRequest } from "@/features/login/services/authService";
import authBg from "@/assets/images/bg-1.png";
import imageLogin from "@/assets/images/image-login.png";

export default function LoginPage() {
  const handleLoginSubmit = async (credentials) => {
    const data = await loginRequest({
      userEmail: credentials.email,
      userPassword: credentials.password,
    });

    if (data.token) {
      sessionStorage.setItem("token", data.token);
    }
    if (data.user) {
      sessionStorage.setItem("user", JSON.stringify(data.user));
    }

    window.location.replace("/home");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4"
        style={{
          backgroundImage: `url(${authBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-background rounded-2xl shadow-xl overflow-hidden">
        <div className="hidden md:flex md:w-1/2 items-center justify-center p-8">
          <div className="w-full max-w-sm flex justify-center">
            <img src={imageLogin} alt="Ilustración de login" className="w-full h-auto object-contain" />
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-16">
          <h2 className="text-display font-heading text-text-primary mb-1">
            Te damos la Bienvenida
          </h2>
          <p className="text-body text-text-secondary mb-8">
            Inicia sesión<br />
            Y disfruta la experiencia
          </p>

          <LoginForm onSubmit={handleLoginSubmit} />
        </div>
      </div>
    </div>
  );
}
import { Outlet } from "react-router-dom";
import authBg from "@/assets/images/bg-1.png"; 

export default function AuthLayout() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-background"
      style={{
        backgroundImage: `url(${authBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Outlet />
    </div>
  );
}
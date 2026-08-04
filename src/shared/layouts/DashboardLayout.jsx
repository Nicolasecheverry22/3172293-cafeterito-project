import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import authBg from "@/assets/images/bg-3.jpg";

export default function DashboardLayout() {
  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        backgroundImage: `url(${authBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed", 
      }}
    >
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
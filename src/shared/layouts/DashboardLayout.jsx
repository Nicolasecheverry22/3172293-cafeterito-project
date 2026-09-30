import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SessionTimeout from "@/features/login/components/SessionTimeout";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen w-full bg-background">
      <SessionTimeout />
       <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        <Outlet />
      </main>
      <Footer/>
    </div>
  );
}
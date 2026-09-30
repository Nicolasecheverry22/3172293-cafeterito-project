import { Outlet } from "react-router-dom";
import FormNavbar from "../components/FormNavbar";
import SessionTimeout from "@/features/login/components/SessionTimeout";

export default function MainLayout() {
  return (
    <div className="min-h-screen w-full bg-background">
      <SessionTimeout />
       <FormNavbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
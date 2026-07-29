import { Outlet } from "react-router-dom";
import authBg from "@/assets/images/bg-3.jpg";
import UserCreateInventary from "@/features/users/components/UserCreateInventary";
export default function CreateInventary(){
    return(
        <>
           <div
    className="min-h-screen"
    style={{
        backgroundImage: `url(${authBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
    }}
>
    <main className="mx-auto">
        <UserCreateInventary />
        <Outlet />
    </main>
</div>
        </>
    );

}
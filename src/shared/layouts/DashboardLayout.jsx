import { Outlet } from "react-router-dom";
import authBg from "@/assets/images/bg-3.jpg";

export default function DashboardLayout(){
    return(
        <>
            <div
                className= "min-h-screen w-full"
                style ={{
                    backgroundImage: `url(${authBg})`,
                    backgroundSize : "cover",
                    backgroundPosition: "center",
                }}  
            >
            <main className="mx-auto">
                <Outlet/>
            </main>    
            </div>
        </>
    );

}
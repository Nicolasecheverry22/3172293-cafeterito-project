import { Navbar } from "../../shared";
import { useNavigate, useParams } from "react-router-dom";
import { Input, Button, StatusSwitch } from "../../shared";
import { SquarePen, UserRoundSearch } from "lucide-react";
import { users } from "../users/data/users";

export default function UserView() {

    const navigate = useNavigate();
    const { id } = useParams();

    const user = users.find((u) => u.id === Number(id));

    if (!user) {
        return (
            <div className="min-h-screen w-full flex flex-col">
                <Navbar />
                <div className="flex items-center gap-3 mt-10 ml-12">
                    <UserRoundSearch className="w-10 h-10 text-text-primary" />
                    <h1 className="text-main font-heading font-bold text-text-primary">
                        Visualizar Usuario
                    </h1>
                </div>
                <p className="ml-12 mt-8 text-red-500">Usuario no encontrado.</p>
            </div>
        );
    }

    // Con esto tomamos la primera letra del nombre y la convertimos en un formato mas ancho estilo bold muy parecido a las fotos de perfil de redes sociales
    const initial = user.userName.charAt(0).toUpperCase();

    // Damos una lista de posibles colores y se le asigna segun el id del usuario
    const colors = [
        "#E57373", "#F06292", "#BA68C8", "#9575CD",
        "#7986CB", "#64B5F6", "#4DB6AC", "#81C784",
        "#FFD54F", "#FF8A65",
    ];
    const bgColor = colors[user.id % colors.length];

    return (
        <div className="min-h-screen w-full flex flex-col">

            <Navbar />

            <div className="flex items-center gap-3 mt-10 ml-12">
                <UserRoundSearch className="w-10 h-10 text-text-primary" />
                <h1 className="text-main font-heading font-bold text-text-primary">
                    Visualizar Usuario
                </h1>
            </div>

            <div className="flex flex-row">

                <div className="bg-[var(--color-gray-200)] rounded-3xl p-8 shadow-sm mt-50 mx-auto w-fit h-fit mt-100 mr-20 ml-20">
                    <div className="flex justify-center">
                        <div className="flex flex-col items-center gap-4 w-fit">
                            <p className="text-[var(--color-black)] font-[var(--font-weight-bold)] text-[var(--fs-lg)]">
                                Estado
                            </p>
                            <StatusSwitch size="lg" defaultChecked={user.is_active} />
                        </div>
                    </div>
                </div>

                <div className="flex flex-row gap-50 bg-[var(--color-gray-600)] rounded-3xl p-8 shadow-sm mt-50 mx-auto w-fit h-fit mt-[80px] mb-20">
                    <div className="flex items-center flex-col gap-8 flex-1">

                        {/* Avatar con inicial */}
                        <div
                            style={{
                                backgroundColor: bgColor,
                                width: "150px",
                                height: "150px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "64px",
                                fontWeight: "bold",
                                color: "#fff",
                                userSelect: "none",
                            }}
                        >
                            {initial}
                        </div>

                        <div className="flex flex-row items-end justify-start gap-60 bg-[var(--color-gray-300)] rounded-3xl p-8 shadow-sm mt-50 mx-auto w-fit mt-[30px]">

                            <div className="w-fit flex flex-col gap-8">
                                <h2>Nombre</h2>
                                <h2>Cedula de Ciudadania</h2>
                                <h2>Direccion</h2>
                                <h2>Telefono</h2>
                                <h2>Correo</h2>
                            </div>

                            <div className="w-80 flex flex-col gap-4">
                                <Input
                                    label=""
                                    name="nameInfo"
                                    type="text"
                                    value={user.userName}
                                    disabled
                                />
                                <Input
                                    label=""
                                    name="documentNumberInfo"
                                    type="text"
                                    value={user.userDocument }
                                    disabled
                                />
                                <Input
                                    label=""
                                    name="addressInfo"
                                    type="text"
                                    value={user.userAddress }
                                    disabled
                                />
                                <Input
                                    label=""
                                    name="phoneInfo"
                                    type="text"
                                    value={user.userPhone}
                                    disabled
                                />
                                <Input
                                    label=""
                                    name="emailInfo"
                                    type="email"
                                    value={user.userEmail}
                                    disabled
                                />
                            </div>

                        </div>
                    </div>
                </div>

                <div className="bg-[var(--color-gray-200)] rounded-3xl p-8 shadow-sm mt-100 mx-auto w-fit h-fit mr-20 ml-20">
                    <div className="flex flex-col items-center gap-4 w-fit">
                        <p className="text-[var(--color-black)] font-[var(--font-weight-bold)] text-[var(--fs-lg)]">
                            Editar Perfil
                        </p>
                        <Button
                            variant="secondary"
                            type="button"
                            size="md"
                            onClick={() => navigate(`/EditUser/${user.id}`)}
                        >
                            <SquarePen className="w-5 h-5 gap-1" />
                            Editar
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}
// UserRegisterForm  componente para registrar un usuario

import { useState, useEffect } from "react"
import { Input, Select, Checkbox, Button} from "@/shared";
import { getDocumentTypes } from "@/services/selectService";
import { useNavigate } from "react-router-dom";
import { userSchema } from "../schemas/userSchema";

export default function UserRegisterForm (){
    // Navegación 
    const navigate = useNavigate();
    
    // Estado del error
    const [ errors, setErrors] = useState({})

    const [formData, setFormData] = useState({
        userName: "",
        userEmail: "",
        userPhone: "",
        userDocumentTypes: "",
        userDocumentNumber: "",
        userPassword: "",
        userImage: [],

        //Flags booleanos
        isStaff: false,
        isActive: true,
        isSuperUser: false,
    });

    const handleChange = (e) => {
        // Se obtiene el nombre del campo y su valor
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            //Se copian todos los valores anteriores del estado
            ...prev,

            //Se actualiza unicamente lo que cambio
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        //Evita que el formulario recargue la página
        e.preventDefault();

        //Validamos los datos del formulario contra el esquema Zod
        //safeParse No lanza excepción, retorna un objeto controlado
        const result = userSchema.safeParse(formData);

        //Verificar en consola si el esquema esta funcionando correctamente
        //console.log(result)

        //Si la validación falla
        if(!result.sucess) {
            //Objeto donde almacenaremos los errores por campo
            const fieldErrors = {};

            //Recorremos cada error generado por Zod
            result.error.issues.forEach((issue) => {
                //issue.path[0] corresponde al nombre del campo
                //issue.message contiene el mensaje de error definido en el schema
                fieldErrors[issue.path[0]] = issue.message;
            });

            //Actualiza,ps eñ estado de errorees para mostratlos en la UI
            setErrors(fieldErrors);

            //Cortamos la ejecución: NO se envia nada al backend

            return;
        }

        //Si la validación pasa, limpiamos errores previos
        setErrors({});

        // Activamos estado de envio (util para deshabiliatr el boton)
        // setIsSubmitting(true)

        try{
            // Llamamos al servicio fronted que consume la API
            // result.data contiene los datos ya validados por Zod
            const response = await createUser(result.data);

            // Log informaativo del desarrollo
            console.log("usuario creado correctamente");
            
            // Navegamos a la vista anterior
            // navigate(-1) equivale a "volver atras"
            navigate(-1)
        
        } catch(error){
            // capturamos errores de red o errores lanzados por el service
            console.error("error:", error.message);

            // Mostramos el mensaje de error al usuario 
            alert(error.message);

        } finally{
            // pase lo que pase, desactivamos el estado de envio
            // setIsSubmitting(false);
        }
    };

    // ============================================
    //             Handle NameChange
    // ============================================

    // const handleNameChange = (e) => { 
    //     const value = e.target.value.trim();


    //     if (value === ""){
    //         console.log("El nombre no puede estar vacio")
    //     };
    // }

    const [documentTypes, setDocumentTypes] = useState([])

    useEffect(() => {
        getDocumentTypes().then(setDocumentTypes);

    },[])

    return(
        <div className="grid items-center justify-center">
            <h1 className="mx-auto my-12 text-title font-bold">Registro de usuarios</h1>
            <form 
                action=""
                onSubmit={handleSubmit}
            >
                <Input
                    label="Nombre"
                    name="userName"
                    type="text"
                    value={formData.userName}
                    placeholder="Ingrese su nombre"
                    htmlFor= "user-name"
                    onChange={handleChange}
                    error={errors.userName}
                />
                <Input
                    label="Correo"
                    name="userEmail"
                    type="email"
                    value={formData.userEmail}
                    placeholder="Ingrese su correo electronico"
                    htmlFor= "user-email"
                    error={errors.userEmail}
                    onChange={handleChange}

                />
                <Input
                    label="Teléfono"
                    name="userPhone"
                    type="tel"
                    value={formData.userPhone}
                    placeholder="Ingrese su número de teléfono"
                    htmlFor= "user-phone"
                    error={errors.userPhone}
                    onChange={handleChange}

                />
                <Select
                    label= "Tipos de documento"
                    name="userDocumentTypes"
                    value={formData.userDocumentTypes}
                    htmlFor="userDocumentTypes"
                    options={documentTypes}
                    error={errors.userDocumentTypes}
                    onChange={handleChange}

                />
                <Input
                    label="Documento"
                    name="userDocumentNumber"
                    type="text"
                    value={formData.userDocumentNumber}
                    placeholder="Ingrese su número de documento"
                    htmlFor= "user-document-number"
                    error={errors.userDocumentNumber}
                    onChange={handleChange}

                />
                <Input
                    label="Contraseña"
                    name="userPassword"
                    type="password"
                    value={formData.userPassword}
                    placeholder="Ingrese su contraseña"
                    htmlFor= "user-password"
                    error={errors.userPassword}
                    onChange={handleChange}

                />

                {/* checkbox */}
                <div className="grid gap-2">
                    <Checkbox
                        id="isSuperUser"
                        name="isSuperUser"
                        label="Es super usuario"
                        checked={formData.isSuperUser}
                        onChange={handleChange}
                    />
                    <Checkbox
                        id="isStaff"
                        name="isStaff"
                        label="Es staff"
                        checked={formData.isStaff}
                        onChange={handleChange}
                    />
                    <Checkbox
                        id="isActive"
                        name="isActive"
                        label="Esta activo"
                        checked={formData.isActive}
                        onChange={handleChange}
                    />
                </div>

                {/*Actions*/}
                <div className="flex gap-6 items-center" >
                    <Button
                        variant= "secondary"
                        size= "sm"
                        type= "button"
                        onClick={() => console.log("Se oprimio el cancelar")}
                    >Cancelar
                    </Button>

                    <Button
                        variant= "primary"
                        size= "md"
                        type= "sumbit"
                        onClick={() => console.log("Se oprimio el submit")}
                
                    >Guardar
                    </Button>
                </div>
            </form>
        </div>
    )
}
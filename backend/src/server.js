// Importamos la instancia de la aplicacion express ya configurada.
// App.js debe encargarse de middlewarse, rutas y configuarcion general
import app from "./app.js"

// Importamos dotenv para cargar variables de entorno desde el archivo .env
import dotenv from "dotenv"

// Ejecutamos la carga de variables de entorno
// sto debe hacerse antes de usar process.env

dotenv.config();

// Definimos el puerto del servidos
// Se prioriza el valor definido en el entorno
//  Y se usa 4000 como valor por defecto en desarrollo 
const PORT = process.env.PORT || 4000;

// Iniciamos el servidor http usando la app EXPRESS
// listen levantan el servidor y queda a la espera de peticiones
app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`)
})
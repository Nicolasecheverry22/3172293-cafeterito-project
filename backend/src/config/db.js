// Immportamos el paquete 'pg' usando el sistmeda de modulos ES. // Importamos el paquete sql para NODE.JS
import pkg from "pg";

//Extraemos la clase pool desde el paquete.
//pool gestiona un conjunto de conexiones reutiizables a la BD 
const {Pool} = pkg;

//importamos dotenv para poder leer variables de entorno desde un archivo .env 
import dotenv from "dotenv";

// Cargamos las variables definidas en el archivos .env
// Esto deberia de ejecutar se antes de acceder a process.env

dotenv.config();

// Creamos y exportamos unsa instancia unica del pool de PostdreSQL n
// Esta instancia se reutiliza en toda la aplicacion
export const pool = new Pool({
    // Host donde se encuentra postgresSQL 
    host: process.env.DB_HOST,

    // Puerto de posotgresSQL (por defecto 5432)
    port: process.env.DB_PORT,

    // Usuario con permisos sobre la base de datos
    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,
    
    // Contraseña del usuario 
    database: process.env.DB_NAME,

    // Numero maximo de conexiones activos en el pool
    max:10,

    // Tiempo maximo (en ms) que una conexion puede estar inactiva antes de ser cerrada automaticamente 
    idleTimeoutMillis: 30000,
});

// Evento que se dispara cada vez que el poll establece  una conexion util para los logs y verifiacion en desarollo
pool.on("connect", ()=> {
    console.log("Conectado a PostgreSQL");
});

// Evento que se diapara cuando ocurre un error en el pool importandoo para monitoreo y diafnossrico de fallos
pool.on("error", (err) => {
    console.log("Error en la conexion con PostgresSQL", err);
})


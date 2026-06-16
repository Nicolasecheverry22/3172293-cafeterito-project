// Componente ConunterEffect
/**
 * Objetivo de esta actividad:
 * Entender que useEffect se vuelve a ejecutar cuando cambia una dependencia
 */
import { useEffect, useState } from "react";

export default function CounterEffect(){

    // Se crea el estado
    const [count, setCount] = useState(0)
    const [message, setMessage] = useState("El contador No ha cambiado")

    // Se crea el efecto
    useEffect(() => {
        if (count === 0){
            setMessage("El contador no ha cambiado");
        } else {
            setMessage(`El contador cambio a: ${count}`) 
        }

    },[count])

    

    return (
        <div>
            <h2>{count}</h2>
            <p>{message}</p>

                {/* Cada vez que se oprime el boton se incrementa el contador */}
            <button onClick={() => setCount(count + 1)} className="border p-6 bg-green-300">Incrementar Efecto</button>


        </div>
    )

}
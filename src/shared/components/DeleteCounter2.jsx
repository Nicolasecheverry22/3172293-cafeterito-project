// Ejemplo de un contadoe sin usar estados

export default function DeleteCounter2(){

    let count=0;
    const increment = ()=>{
        count = count + 1;
        console.log("el nuevo valor es:",count)
    }
    return(
        <div>
        <p>Contador: {count}</p>
        <button onClick={increment} className="border p-6 rounded-md
        bg-yellow-500">
            Incrementar</button>
        </div>
    
    )
}
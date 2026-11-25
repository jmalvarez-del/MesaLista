
import { useState, useEffect } from "react";

function BasicTypes() {

    const [mensaje, setMensaje] = useState<string>("Hola MesaLista");

    useEffect(() => {
        console.log("Componente BasicTypes montado");
    }, []);

    return (
        <>
            <h1>{mensaje}</h1>
            <button onClick={() => setMensaje("Bienvenido a MesaLista")}>
                Cambiar mensaje
            </button>
        </>
    );
}

export default BasicTypes;


document.addEventListener("DOMContentLoaded", cargarMenu);

async function cargarMenu() {
    const listaMenu = document.getElementById("listaMenu");
    const mensajeMenu = document.getElementById("mensajeMenu");

    if (!listaMenu || !mensajeMenu) {
        return;
    }

    try {
        mensajeMenu.textContent = "Cargando menú...";

        const respuesta = await fetch("http://localhost:3000/menu");

        if (!respuesta.ok) {
            throw new Error("No fue posible obtener el menú.");
        }

        const platos = await respuesta.json();

        listaMenu.replaceChildren();

        if (platos.length === 0) {
            mensajeMenu.textContent = "Todavía no hay platos disponibles.";
            return;
        }

        platos.forEach((plato) => {
            const tarjeta = document.createElement("article");
            tarjeta.className = "menu-tarjeta";

            const imagen = document.createElement("div");
            imagen.className = "menu-imagen";

            if (plato.image) {
                const foto = document.createElement("img");
                foto.src = plato.image;
                foto.alt = plato.name;
                imagen.appendChild(foto);
            } else {
                imagen.textContent = "Fotografía próximamente";
            }

            const contenido = document.createElement("div");
            contenido.className = "menu-contenido";

            const nombre = document.createElement("h3");
            nombre.textContent = plato.name;

            const ingredientes = document.createElement("p");
            ingredientes.className = "menu-ingredientes";
            ingredientes.textContent = plato.ingredients;

            const precio = document.createElement("p");
            precio.className = "menu-precio";
            precio.textContent = plato.price.toLocaleString("es-CO", {
                style: "currency",
                currency: "COP",
                maximumFractionDigits: 0
            });

            contenido.append(nombre, ingredientes, precio);
            tarjeta.append(imagen, contenido);
            listaMenu.appendChild(tarjeta);
        });

        mensajeMenu.textContent = "";

    } catch (error) {
        console.error("Error al cargar el menú:", error);
        mensajeMenu.textContent =
            "No fue posible cargar el menú. Intenta nuevamente más tarde.";
    }
}

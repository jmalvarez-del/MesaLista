
document.addEventListener("DOMContentLoaded", cargarMenu);

// Platos destacados para mostrar cuando la base de datos esta vacia
const menuDestacado = [
    {
        name: "Bandeja paisa",
        ingredients: "Una deliciosa combinacion de sabores tradicionales colombianos, con arroz, frijoles, carne, huevo y platano.",
        price: 35000,
        image: "../img/menu/bandeja-paisa.jpg"
    },
    {
        name: "Chuleta de cerdo",
        ingredients: "Chuleta de cerdo apanada, acompañada de arroz, papas y ensalada.",
        price: 35000,
        image: "../img/menu/chuleta-cerdo.jpg"
    },
    {
        name: "Churrasco",
        ingredients: "Carne a la parrilla acompañada de arroz, papas y ensalada.",
        price: 35000,
        image: "../img/menu/churrasco.jpg"
    },
    {
        name: "Arroz con camarones",
        ingredients: "Arroz preparado con camarones y acompañado de ensalada y otros complementos.",
        price: 42000,
        image: "../img/menu/arroz-camarones.jpg"
    },
    {
        name: "Pechuga a la plancha",
        ingredients: "Pechuga de pollo preparada a la plancha, con sus respectivos acompañamientos.",
        price: 26000,
        image: "../img/menu/pechuga.jpg"
    },
    {
        name: "Costilla de cerdo BBQ",
        ingredients: "Costilla de cerdo bañada en salsa BBQ, acompañada de papas y ensalada.",
        price: 37000,
        image: "../img/menu/costilla-bbq.jpg"
    }
];

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
            throw new Error("No fue posible obtener el menu.");
        }

        const platosBD = await respuesta.json();

        const platos = platosBD.length > 0
            ? platosBD
            : menuDestacado;

        mostrarPlatos(platos, listaMenu);

        mensajeMenu.textContent = "";

    } catch (error) {
        console.error("Error al cargar el menu:", error);

        // Si falla la consulta, mostramos el menu destacado
        mostrarPlatos(menuDestacado, listaMenu);

        mensajeMenu.textContent = "";
    }
}

function mostrarPlatos(platos, listaMenu) {
    listaMenu.replaceChildren();

    platos.forEach((plato) => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "menu-tarjeta";

        const imagen = document.createElement("div");
        imagen.className = "menu-imagen";

        const foto = document.createElement("img");
        foto.src = plato.image || "../img/menu/sin-imagen.jpg";
        foto.alt = plato.name;
        foto.loading = "lazy";

        foto.onerror = () => {
            imagen.textContent = "Imagen no disponible";
        };

        imagen.appendChild(foto);

        const contenido = document.createElement("div");
        contenido.className = "menu-contenido";

        const nombre = document.createElement("h3");
        nombre.textContent = plato.name;

        const ingredientes = document.createElement("p");
        ingredientes.className = "menu-ingredientes";
        ingredientes.textContent = plato.ingredients;

        const precio = document.createElement("p");
        precio.className = "menu-precio";
        precio.textContent = Number(plato.price).toLocaleString("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0
        });

        contenido.append(nombre, ingredientes, precio);
        tarjeta.append(imagen, contenido);

        listaMenu.appendChild(tarjeta);
    });
}

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "admin") {
    window.location.href = "../index.html";
}

const inicioSection = document.getElementById("inicio-section");
const reservasSection = document.getElementById("reservas-section");
const usuariosSection = document.getElementById("usuarios-section");


// Mostrar Inicio
document.getElementById("inicio-btn").addEventListener("click", () => {
    inicioSection.style.display = "block";
    reservasSection.style.display = "none";
    usuariosSection.style.display = "none";
});


// Mostrar Reservas
document.getElementById("reservas-btn").addEventListener("click", () => {
    inicioSection.style.display = "none";
    reservasSection.style.display = "block";
    usuariosSection.style.display = "none";

    cargarReservas();
});


// Mostrar Usuarios
document.getElementById("usuarios-btn").addEventListener("click", () => {
    inicioSection.style.display = "none";
    reservasSection.style.display = "none";
    usuariosSection.style.display = "block";
});


// Cerrar sesión
document.getElementById("cerrar-sesion").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    window.location.href = "../index.html";
});


// Crear reserva
document.getElementById("reserva-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const reserva = {
        userId: Number(document.getElementById("userId").value),
        tableNumber: Number(document.getElementById("tableNumber").value),
        date: document.getElementById("date").value,
        time: document.getElementById("time").value,
        numberOfPeople: Number(document.getElementById("numberOfPeople").value)
    };

    try {
        const respuesta = await fetch("http://localhost:3000/reservations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(reserva)
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
            document.getElementById("mensaje").textContent =
                data.error || "Error al crear la reserva";
            return;
        }

        document.getElementById("mensaje").textContent =
            "Reserva creada correctamente";

        document.getElementById("reserva-form").reset();

        cargarReservas();

    } catch (error) {
        console.error(error);

        document.getElementById("mensaje").textContent =
            "No se pudo conectar con el servidor";
    }
});


// Obtener reservas
async function cargarReservas() {

    try {
        const respuesta = await fetch("http://localhost:3000/reservations", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
            document.getElementById("lista-reservas").textContent =
                data.error || "Error al obtener las reservas";
            return;
        }

        document.getElementById("lista-reservas").textContent =
            JSON.stringify(data, null, 2);

    } catch (error) {
        console.error(error);

        document.getElementById("lista-reservas").textContent =
            "No se pudo conectar con el servidor";
    }
}

document.getElementById("cargar-reservas")
    .addEventListener("click", cargarReservas);

    // Obtener usuarios
async function cargarUsuarios() {
    try {
        const respuesta = await fetch("http://localhost:3000/users", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
            document.getElementById("lista-usuarios").textContent =
                data.error || "Error al obtener los usuarios";
            return;
        }

        document.getElementById("lista-usuarios").textContent =
            JSON.stringify(data, null, 2);

    } catch (error) {
        console.error(error);

        document.getElementById("lista-usuarios").textContent =
            "No se pudo conectar con el servidor";
    }
}

document.getElementById("cargar-usuarios")
    .addEventListener("click", cargarUsuarios);
    
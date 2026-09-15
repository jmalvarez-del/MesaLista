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


async function cargarReservas() {

    const contenedor = document.getElementById("lista-reservas");

    contenedor.innerHTML = "<p>Cargando reservas...</p>";

    try {

        const respuesta = await fetch(
            "http://localhost:3000/reservations",
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await respuesta.json();

        if (!respuesta.ok) {

            contenedor.innerHTML = `
                <p>❌ ${data.error || "Error al obtener las reservas"}</p>
            `;

            return;
        }

        if (data.length === 0) {

            contenedor.innerHTML = `
                <p>No hay reservas registradas.</p>
            `;

            return;
        }

        contenedor.innerHTML = "";

        data.forEach(reserva => {

            const tarjeta = document.createElement("div");

            tarjeta.className = "tarjeta-reserva";

            tarjeta.innerHTML = `
                <h3>Reserva #${reserva.id}</h3>

                <p>
                    <strong>Usuario:</strong>
                    ${reserva.userId}
                </p>

                <p>
                    <strong>Mesa:</strong>
                    ${reserva.tableNumber}
                </p>

                <p>
                    <strong>Fecha:</strong>
                    ${reserva.date}
                </p>

                <p>
                    <strong>Hora:</strong>
                    ${reserva.time}
                </p>

                <p>
                    <strong>Personas:</strong>
                    ${reserva.numberOfPeople}
                </p>

                <p>
                    <strong>Estado:</strong>
                    <span class="estado-reserva">
                        ${reserva.status}
                    </span>
                </p>
            `;

            contenedor.appendChild(tarjeta);

        });

    } catch (error) {

        console.error(error);

        contenedor.innerHTML = `
            <p>❌ No se pudo conectar con el servidor.</p>
        `;
    }
}

document.getElementById("cargar-reservas")
    .addEventListener("click", cargarReservas);

    // Obtener usuarios
async function cargarUsuarios() {

    const contenedor = document.getElementById("lista-usuarios");

    contenedor.innerHTML = "<p>Cargando usuarios...</p>";

    try {

        const respuesta = await fetch(
            "http://localhost:3000/users",
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await respuesta.json();

        if (!respuesta.ok) {

            contenedor.innerHTML = `
                <p>❌ ${data.error || "Error al obtener los usuarios"}</p>
            `;

            return;
        }

        if (data.length === 0) {

            contenedor.innerHTML = `
                <p>No hay usuarios registrados.</p>
            `;

            return;
        }

        contenedor.innerHTML = "";

        data.forEach(usuario => {

            const tarjeta = document.createElement("div");

            tarjeta.className = "tarjeta-usuario";

            tarjeta.innerHTML = `
                <h3>${usuario.name}</h3>

                <p>
                    <strong>ID:</strong>
                    ${usuario.id}
                </p>

                <p>
                    <strong>Edad:</strong>
                    ${usuario.age}
                </p>

                <p>
                    <strong>Correo:</strong>
                    ${usuario.email}
                </p>

                <p>
                    <strong>Rol:</strong>
                    ${usuario.role}
                </p>
            `;

            contenedor.appendChild(tarjeta);

        });

    } catch (error) {

        console.error(error);

        contenedor.innerHTML = `
            <p>❌ No se pudo conectar con el servidor.</p>
        `;
    }
}
document.getElementById("cargar-usuarios")
    .addEventListener("click", cargarUsuarios);
    
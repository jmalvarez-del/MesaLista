const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "usuario") {
    window.location.href = "../index.html";
}

const inicioSection = document.getElementById("inicio-section");
const reservasSection = document.getElementById("reservas-section");
const misReservasSection = document.getElementById("mis-reservas-section");

// INICIO
document.getElementById("inicio-btn").addEventListener("click", () => {

    inicioSection.style.display = "block";
    reservasSection.style.display = "none";
    misReservasSection.style.display = "none";

});

// RESERVAR MESA
document.getElementById("reservas-btn").addEventListener("click", () => {

    inicioSection.style.display = "none";
    reservasSection.style.display = "block";
    misReservasSection.style.display = "none";

});

// MIS RESERVAS
document.getElementById("mis-reservas-btn").addEventListener("click", () => {

    inicioSection.style.display = "none";
    reservasSection.style.display = "none";
    misReservasSection.style.display = "block";

});

// CERRAR SESIÓN
document.getElementById("cerrar-sesion").addEventListener("click", () => {

    localStorage.removeItem("token");
    localStorage.removeItem("role");

    window.location.href = "../index.html";

});
// CONSULTAR MESAS DISPONIBLES
document.getElementById("consultar-disponibilidad").addEventListener("click", async () => {

    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const numberOfPeople = document.getElementById("numberOfPeople").value;

    const contenedor = document.getElementById("mesas-disponibles");

    if (!date || !time || !numberOfPeople) {
        contenedor.innerHTML = "<p>Completa todos los campos.</p>";
        return;
    }

    try {

        const respuesta = await fetch(
            `http://localhost:3000/reservations/available?date=${date}&time=${time}&numberOfPeople=${numberOfPeople}`,
            {
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        const mesas = await respuesta.json();

        if (!respuesta.ok) {
            contenedor.innerHTML = `<p>${mesas.error}</p>`;
            return;
        }

        if (mesas.length === 0) {
            contenedor.innerHTML = "<p>No hay mesas disponibles para esos datos.</p>";
            return;
        }

        contenedor.innerHTML = "<h3>Mesas disponibles:</h3>";

        mesas.forEach(mesa => {

    const boton = document.createElement("button");

    boton.textContent =
        `Mesa ${mesa.number} - ${mesa.type} - ${mesa.capacity} personas`;

    boton.style.display = "block";
    boton.style.margin = "10px 0";

    boton.addEventListener("click", () => {

        document.querySelectorAll("#mesas-disponibles button")
            .forEach(boton => {
                boton.style.fontWeight = "normal";
            });

        boton.style.fontWeight = "bold";

       window.mesaSeleccionada = mesa.number;

let confirmacion = document.getElementById("confirmacion-reserva");

if (!confirmacion) {
    confirmacion = document.createElement("div");
    confirmacion.id = "confirmacion-reserva";
    confirmacion.style.marginTop = "20px";

    contenedor.appendChild(confirmacion);
}

confirmacion.innerHTML = `
    <p>
        ✅ Mesa ${mesa.number} seleccionada
    </p>

    <button id="confirmar-reserva">
        Confirmar reserva
    </button>
`;

document.getElementById("confirmar-reserva").addEventListener("click", async () => {

    try {

        const respuesta = await fetch(
            "http://localhost:3000/reservations/client",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    tableNumber: window.mesaSeleccionada,
                    date: date,
                    time: time,
                    numberOfPeople: numberOfPeople
                })
            }
        );

        const data = await respuesta.json();

        if (!respuesta.ok) {
            confirmacion.innerHTML = `<p>❌ ${data.error}</p>`;
            return;
        }

        confirmacion.innerHTML = `
            <p>✅ Reserva creada correctamente.</p>
            <p>
                Mesa: ${data.reserva.tableNumber}<br>
                Fecha: ${data.reserva.date}<br>
                Hora: ${data.reserva.time}<br>
                Personas: ${data.reserva.numberOfPeople}
            </p>
        `;

    } catch (error) {

        console.error(error);

        confirmacion.innerHTML =
            "<p>❌ No se pudo crear la reserva.</p>";
    }
});
    });

    contenedor.appendChild(boton);
    });
    } catch (error) {

        console.error(error);

        contenedor.innerHTML =
            "<p>No se pudo consultar la disponibilidad.</p>";
    }
});
// CARGAR MIS RESERVAS
document.getElementById("cargar-mis-reservas").addEventListener("click", async () => {

    const contenedor = document.getElementById("lista-mis-reservas");

    try {

        const respuesta = await fetch(
            "http://localhost:3000/reservations/my",
            {
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        const reservas = await respuesta.json();

        if (!respuesta.ok) {
            contenedor.textContent = reservas.error;
            return;
        }

        if (reservas.length === 0) {
            contenedor.textContent = "No tienes reservas.";
            return;
        }

        contenedor.textContent = JSON.stringify(reservas, null, 2);

    } catch (error) {

        console.error(error);

        contenedor.textContent =
            "No se pudieron cargar tus reservas.";
    }
});
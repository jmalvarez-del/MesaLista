const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "usuario") {
    window.location.href = "../index.html";
}

const inicioSection = document.getElementById("inicio-section");
const reservasSection = document.getElementById("reservas-section");
const misReservasSection = document.getElementById("mis-reservas-section");

// ============================
// NAVEGACIÓN
// ============================

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


// ============================
// CONSULTAR MESAS DISPONIBLES
// ============================

document.getElementById("consultar-disponibilidad").addEventListener("click", async () => {

    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const numberOfPeople = document.getElementById("numberOfPeople").value;

    const contenedor = document.getElementById("mesas-disponibles");

    if (!date || !time || !numberOfPeople) {

        contenedor.innerHTML =
            "<p>Completa todos los campos para consultar la disponibilidad.</p>";

        return;
    }

    contenedor.innerHTML = "<p>Consultando mesas disponibles...</p>";

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

            contenedor.innerHTML =
                `<p>❌ ${mesas.error}</p>`;

            return;
        }

        if (mesas.length === 0) {

            contenedor.innerHTML = `
                <div class="sin-reservas">
                    <p>
                        No hay mesas disponibles para la fecha,
                        hora y cantidad de personas seleccionadas.
                    </p>
                </div>
            `;

            return;
        }

        contenedor.innerHTML =
            "<h3>Mesas disponibles</h3>";

        mesas.forEach(mesa => {

            const tarjeta = document.createElement("div");

            tarjeta.className = "mesa";

            tarjeta.innerHTML = `
                <h3>Mesa ${mesa.number}</h3>

                <p>
                    <strong>Tipo:</strong> ${mesa.type}
                </p>

                <p>
                    <strong>Capacidad:</strong>
                    ${mesa.capacity} personas
                </p>

                <button class="seleccionar-mesa">
                    Seleccionar mesa
                </button>
            `;

            const boton = tarjeta.querySelector(".seleccionar-mesa");

            boton.addEventListener("click", () => {

                // Quitar selección anterior
                document
                    .querySelectorAll(".mesa")
                    .forEach(mesaElemento => {
                        mesaElemento.style.border =
                            "1px solid #ddd";
                    });

                // Marcar mesa seleccionada
                tarjeta.style.border =
                    "2px solid #16a34a";

                window.mesaSeleccionada = mesa.number;

                mostrarConfirmacion(
                    contenedor,
                    mesa,
                    date,
                    time,
                    numberOfPeople
                );
            });

            contenedor.appendChild(tarjeta);

        });

    } catch (error) {

        console.error(error);

        contenedor.innerHTML = `
            <p>
                ❌ No se pudo consultar la disponibilidad.
            </p>
        `;
    }
});


// ============================
// CONFIRMAR RESERVA
// ============================

function mostrarConfirmacion(
    contenedor,
    mesa,
    date,
    time,
    numberOfPeople
) {

    const modal = document.getElementById("modal-reserva");
    const mensaje = document.getElementById("modal-mensaje");
    const cancelar = document.getElementById("cancelar-reserva");
    const confirmar = document.getElementById("confirmar-reserva");

    mensaje.innerHTML = `
        <strong>Mesa ${mesa.number}</strong><br><br>

        <strong>Fecha:</strong> ${date}<br>
        <strong>Hora:</strong> ${time}<br>
        <strong>Personas:</strong> ${numberOfPeople}
    `;

    modal.style.display = "flex";

    cancelar.onclick = () => {
        modal.style.display = "none";
    };

    confirmar.onclick = async () => {

        confirmar.disabled = true;
        confirmar.textContent = "Confirmando...";

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

                mensaje.innerHTML = `
                    <p>❌ ${data.error}</p>
                `;

                confirmar.disabled = false;
                confirmar.textContent = "Sí, confirmar reserva";

                return;
            }

            modal.style.display = "none";

            alert("✅ Reserva creada correctamente.");

        } catch (error) {

            console.error(error);

            mensaje.innerHTML = `
                <p>
                    ❌ No se pudo crear la reserva.
                </p>
            `;

            confirmar.disabled = false;
            confirmar.textContent = "Sí, confirmar reserva";
        }
    };
}


// ============================
// CARGAR MIS RESERVAS
// ============================

document
    .getElementById("cargar-mis-reservas")
    .addEventListener("click", async () => {

        const contenedor =
            document.getElementById("lista-mis-reservas");

        contenedor.innerHTML =
            "<p>Cargando reservas...</p>";

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

                contenedor.innerHTML =
                    `<p>❌ ${reservas.error}</p>`;

                return;
            }

            if (reservas.length === 0) {

                contenedor.innerHTML = `
                    <div class="sin-reservas">
                        <p>
                            No tienes reservas registradas.
                        </p>
                    </div>
                `;

                return;
            }

            contenedor.innerHTML = "";

            reservas.forEach(reserva => {

                const tarjeta =
                    document.createElement("div");

                tarjeta.className = "reserva";

                tarjeta.innerHTML = `
                    <h3>
                        Reserva #${reserva.id}
                    </h3>

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
                        <span class="estado">
                            ${reserva.status}
                        </span>
                    </p>
                `;

                contenedor.appendChild(tarjeta);

            });

        } catch (error) {

            console.error(error);

            contenedor.innerHTML = `
                <p>
                    ❌ No se pudieron cargar tus reservas.
                </p>
            `;
        }
    });
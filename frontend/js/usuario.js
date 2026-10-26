const API_URL = "http://localhost:3000";

const token = localStorage.getItem("token");
const usuarioGuardado = localStorage.getItem("usuario");

const nombreUsuario = document.getElementById("nombreUsuario");
const cerrarSesion = document.getElementById("cerrarSesion");
const formReserva = document.getElementById("formReserva");
const mensajeReserva = document.getElementById("mensajeReserva");
const mensajeListado = document.getElementById("mensajeListado");
const tablaReservas = document.getElementById("tablaReservas");
const actualizarReservas = document.getElementById("actualizarReservas");
const modalMesas = document.getElementById("modalMesas");
const listaMesas = document.getElementById("listaMesas");
const resumenReserva = document.getElementById("resumenReserva");
const mensajeMesas = document.getElementById("mensajeMesas");
const confirmarMesa = document.getElementById("confirmarMesa");
const cerrarModalMesas = document.getElementById("cerrarModalMesas");
const cancelarSeleccionMesa = document.getElementById("cancelarSeleccionMesa");

let reservaPendiente = null;


// Proteger el panel: se necesita una sesión iniciada.
if (!token) {
    window.location.href = "/";
} else {
    try {
        const usuario = usuarioGuardado
            ? JSON.parse(usuarioGuardado)
            : {};

        if (usuario.role === "admin") {
            window.location.href = "/admin/admin-dashboard.html";
        } else {
            nombreUsuario.textContent = usuario.email
                ? `Sesión iniciada como ${usuario.email}`
                : "Gestiona tus reservas desde aquí.";
        }
    } catch (error) {
        localStorage.removeItem("usuario");
        window.location.href = "/";
    }
}

// Función común para las solicitudes al backend.
async function solicitarAPI(ruta, opciones = {}) {
    const respuesta = await fetch(`${API_URL}${ruta}`, {
        ...opciones,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(opciones.headers || {})
        }
    });

    const texto = await respuesta.text();
    let datos = {};

    try {
        datos = texto ? JSON.parse(texto) : {};
    } catch {
        datos = { message: texto };
    }

    if (respuesta.status === 401 || respuesta.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        window.location.href = "/";
        throw new Error("La sesión venció o no tienes autorización.");
    }

    if (!respuesta.ok) {
        throw new Error(
            datos.error || datos.message || "No fue posible completar la solicitud."
        );
    }

    return datos;
}

// Cerrar sesión.
cerrarSesion.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/";
});

// Evitar seleccionar una fecha anterior a hoy.
const fechaInput = document.getElementById("fecha");
const hoy = new Date();
const fechaLocal = [
    hoy.getFullYear(),
    String(hoy.getMonth() + 1).padStart(2, "0"),
    String(hoy.getDate()).padStart(2, "0")
].join("-");

fechaInput.min = fechaLocal;

// Crear una reserva.
formReserva.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    mensajeReserva.textContent = "";
    mensajeReserva.className = "usuario-mensaje";

    const date = document.getElementById("fecha").value;
    const time = document.getElementById("hora").value;
    const numberOfPeople = Number(
        document.getElementById("personas").value
    );

    if (!date || !time ||
        !Number.isInteger(numberOfPeople) ||
        numberOfPeople < 1) {
        mensajeReserva.textContent =
            "Completa correctamente todos los campos.";
        return;
    }

    if (date < fechaLocal) {
        mensajeReserva.textContent =
            "Selecciona una fecha válida.";
        return;
    }

    mensajeReserva.textContent = "Buscando mesas disponibles...";

    try {
        const parametros = new URLSearchParams({
            date,
            time,
            numberOfPeople: String(numberOfPeople)
        });

        const mesas = await solicitarAPI(
            `/reservations/available?${parametros.toString()}`
        );

        if (!Array.isArray(mesas)) {
            throw new Error(
                "El servidor no devolvió una lista válida de mesas."
            );
        }

        if (mesas.length === 0) {
            mensajeReserva.textContent =
                "No hay mesas disponibles para esa fecha, hora y cantidad de personas.";
            return;
        }

        reservaPendiente = {
            date,
            time,
            numberOfPeople
        };

        mostrarMesasDisponibles(mesas);
        mensajeReserva.textContent = "";

    } catch (error) {
        mensajeReserva.textContent = error.message;
        mensajeReserva.classList.add("mensaje-error");
    }
});


/* Mostrar las mesas devueltas por el backend. */
function mostrarMesasDisponibles(mesas) {
    listaMesas.replaceChildren();
    mensajeMesas.textContent = "";
    confirmarMesa.disabled = true;

    resumenReserva.textContent =
        `${reservaPendiente.date} · ${reservaPendiente.time} · ` +
        `${reservaPendiente.numberOfPeople} persona(s)`;

    mesas.forEach((mesa) => {
        const etiqueta = document.createElement("label");
        etiqueta.className = "usuario-mesa-opcion";

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "mesaSeleccionada";
        radio.value = mesa.number;
        radio.required = true;

        radio.addEventListener("change", () => {
            confirmarMesa.disabled = false;
        });

        const informacion = document.createElement("div");
        informacion.className = "usuario-mesa-info";

        const nombre = document.createElement("strong");
        nombre.textContent = `Mesa ${mesa.number}`;

        const detalle = document.createElement("span");
        detalle.textContent =
            `${mesa.type} · Capacidad para ${mesa.capacity} persona(s)`;

        informacion.append(nombre, detalle);
        etiqueta.append(radio, informacion);
        listaMesas.appendChild(etiqueta);
    });

    modalMesas.hidden = false;
}


/* Confirmar la mesa elegida y crear la reserva. */
confirmarMesa.addEventListener("click", async () => {
    const seleccion = document.querySelector(
        'input[name="mesaSeleccionada"]:checked'
    );

    if (!seleccion || !reservaPendiente) {
        mensajeMesas.textContent = "Selecciona una mesa para continuar.";
        return;
    }

    const tableNumber = Number(seleccion.value);

    confirmarMesa.disabled = true;
    cancelarSeleccionMesa.disabled = true;
    cerrarModalMesas.disabled = true;

    mensajeMesas.textContent = "Confirmando reserva...";

    try {
        await solicitarAPI("/reservations/client", {
            method: "POST",
            body: JSON.stringify({
                tableNumber,
                date: reservaPendiente.date,
                time: reservaPendiente.time,
                numberOfPeople: reservaPendiente.numberOfPeople
            })
        });

        cerrarVentanaMesas();

        mensajeReserva.textContent =
            "¡Reserva creada correctamente!";
        mensajeReserva.className =
            "usuario-mensaje mensaje-exito";

        formReserva.reset();
        fechaInput.min = fechaLocal;
        document.getElementById("personas").value = 2;

        await cargarReservas();

    } catch (error) {
        mensajeMesas.textContent = error.message;
        mensajeMesas.className =
            "usuario-mensaje mensaje-error";

        confirmarMesa.disabled = false;
        cancelarSeleccionMesa.disabled = false;
        cerrarModalMesas.disabled = false;
    }
});


/* Cerrar la ventana sin crear una reserva. */
function cerrarVentanaMesas() {
    modalMesas.hidden = true;
    listaMesas.replaceChildren();
    mensajeMesas.textContent = "";
    mensajeMesas.className = "usuario-mensaje";

    confirmarMesa.disabled = true;
    cancelarSeleccionMesa.disabled = false;
    cerrarModalMesas.disabled = false;

    reservaPendiente = null;
}

cerrarModalMesas.addEventListener("click", cerrarVentanaMesas);
cancelarSeleccionMesa.addEventListener("click", cerrarVentanaMesas);

// Agregar texto a una celda sin insertar HTML recibido del servidor.
function agregarCelda(fila, valor) {
    const celda = document.createElement("td");
    celda.textContent =
        valor === null || valor === undefined || valor === ""
            ? "—"
            : String(valor);

    fila.appendChild(celda);
}

// Consultar las reservas del cliente autenticado.
async function cargarReservas() {
    tablaReservas.replaceChildren();

    const filaCarga = document.createElement("tr");
    const celdaCarga = document.createElement("td");
    celdaCarga.colSpan = 6;
    celdaCarga.textContent = "Cargando reservas...";
    filaCarga.appendChild(celdaCarga);
    tablaReservas.appendChild(filaCarga);

    mensajeListado.textContent = "";

    try {
        const datos = await solicitarAPI("/reservations/my");
        const reservas = Array.isArray(datos)
            ? datos
            : datos.reservations || datos.reservas || [];

        tablaReservas.replaceChildren();

        if (reservas.length === 0) {
            const fila = document.createElement("tr");
            const celda = document.createElement("td");
            celda.colSpan = 6;
            celda.textContent = "Todavía no tienes reservas.";
            fila.appendChild(celda);
            tablaReservas.appendChild(fila);
            return;
        }

        reservas.forEach((reserva) => {
            const fila = document.createElement("tr");

            agregarCelda(fila, reserva.date ?? reserva.fecha);
            agregarCelda(fila, reserva.time ?? reserva.hora);
            agregarCelda(
                fila,
                reserva.people ?? reserva.personas ?? reserva.numberOfPeople
            );

            const mesa =
                reserva.table?.number ??
                reserva.table?.name ??
                reserva.tableId ??
                reserva.table_id ??
                reserva.mesaId;

            agregarCelda(fila, mesa);
            agregarCelda(fila, reserva.status ?? reserva.estado ?? "Registrada");

            const celdaAcciones = document.createElement("td");
            const botonCancelar = document.createElement("button");

            botonCancelar.type = "button";
            botonCancelar.textContent = "Cancelar";
            botonCancelar.className = "usuario-boton-cancelar";

            botonCancelar.addEventListener("click", () => {
                cancelarReserva(reserva.id, botonCancelar);
            });

            celdaAcciones.appendChild(botonCancelar);
            fila.appendChild(celdaAcciones);
            tablaReservas.appendChild(fila);
        });
    } catch (error) {
        tablaReservas.replaceChildren();
        mensajeListado.textContent = error.message;
        mensajeListado.classList.add("mensaje-error");
    }
}

// Cancelar una reserva existente.
async function cancelarReserva(id, boton) {
    if (!id) {
        mensajeListado.textContent = "No se encontró el identificador de la reserva.";
        return;
    }

    const confirmar = window.confirm(
        "¿Estás seguro de que deseas cancelar esta reserva?"
    );

    if (!confirmar) return;

    boton.disabled = true;
    mensajeListado.textContent = "Cancelando reserva...";

    try {
        await solicitarAPI(`/reservations/${encodeURIComponent(id)}`, {
            method: "DELETE"
        });

        mensajeListado.textContent = "Reserva cancelada correctamente.";
        mensajeListado.className = "usuario-mensaje mensaje-exito";
        await cargarReservas();
    } catch (error) {
        mensajeListado.textContent =
            `${error.message} Si el backend no permite cancelar desde el panel del cliente, ` +
            "Darwin debe habilitar esa operación en la ruta de reservas.";
        mensajeListado.className = "usuario-mensaje mensaje-error";
        boton.disabled = false;
    }
}

actualizarReservas.addEventListener("click", cargarReservas);

// Cargar la información al abrir el panel.
if (token) {
    cargarReservas();
}
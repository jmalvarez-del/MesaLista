
const loginForm = document.getElementById("loginForm");
const registroForm = document.getElementById("registroForm");
const contenedorLogin = document.getElementById("contenedorLogin");
const contenedorRegistro = document.getElementById("contenedorRegistro");
const mensaje = document.getElementById("mensaje");
console.log("Correo enviado:", JSON.stringify(email));
console.log("Longitud de contraseña:", password.length);

const mostrarRegistro = document.getElementById("mostrarRegistro");
const mostrarLogin = document.getElementById("mostrarLogin");

// Cambiar entre inicio de sesión y registro
mostrarRegistro.addEventListener("click", function (event) {
    event.preventDefault();

    contenedorLogin.hidden = true;
    contenedorRegistro.hidden = false;
    mensaje.textContent = "";
});

mostrarLogin.addEventListener("click", function (event) {
    event.preventDefault();

    contenedorRegistro.hidden = true;
    contenedorLogin.hidden = false;
    mensaje.textContent = "";
});

// Registrar una cuenta
registroForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("nombreRegistro").value.trim();
    const age = Number(document.getElementById("edadRegistro").value);
    const email = document.getElementById("correoRegistro").value.trim();
    const password = document.getElementById("contrasenaRegistro").value;
    const boton = registroForm.querySelector('button[type="submit"]');

    if (!Number.isInteger(age) || age < 18 || age > 120) {
        mensaje.textContent = "La edad debe estar entre 18 y 120 años.";
        return;
    }

    if (password.length < 8) {
        mensaje.textContent = "La contraseña debe tener al menos 8 caracteres.";
        return;
    }

    mensaje.textContent = "Creando tu cuenta...";
    boton.disabled = true;

    try {
        const respuesta = await fetch("/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                age,
                email,
                password
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.textContent = datos.error || "No fue posible crear la cuenta.";
            return;
        }

        registroForm.reset();
        contenedorRegistro.hidden = true;
        contenedorLogin.hidden = false;

        document.getElementById("email").value = email;

        mensaje.textContent =
            "¡Cuenta creada correctamente! Ahora puedes iniciar sesión.";

    } catch (error) {
        console.error("Error al registrar usuario:", error);
        mensaje.textContent = "No se pudo conectar con el servidor.";
    } finally {
        boton.disabled = false;
    }
});

// Iniciar sesión
loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const boton = loginForm.querySelector('button[type="submit"]');

    mensaje.textContent = "Iniciando sesión...";
    boton.disabled = true;

    try {
        const respuesta = await fetch("/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.textContent =
                datos.error || "No fue posible iniciar sesión.";
            return;
        }

        if (!datos.token) {
            mensaje.textContent =
                "El servidor no devolvió el token de acceso.";
            return;
        }

        // Leer el contenido del token JWT
        const partesToken = datos.token.split(".");
        const payload = JSON.parse(atob(partesToken[1]));

        // Conservar las claves que utiliza el proyecto
        localStorage.setItem("token", datos.token);
        localStorage.setItem("usuario", JSON.stringify(payload));

        // Redirigir según el rol
        if (payload.role === "admin") {
            window.location.href = "/admin/admin-dashboard.html";
        } else {
            window.location.href = "/usuario/usuario-dashboard.html";
        }

    } catch (error) {
        console.error("Error de inicio de sesión:", error);
        mensaje.textContent = "No se pudo conectar con el servidor.";
    } finally {
        boton.disabled = false;
    }
});


const loginForm = document.getElementById("loginForm");
const mensaje = document.getElementById("mensaje");
console.log("Correo enviado:", JSON.stringify(email));
console.log("Longitud de contraseña:", password.length);

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    mensaje.textContent = "Iniciando sesión...";

    try {
        const respuesta = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.textContent = datos.error || "No fue posible iniciar sesión.";
            return;
        }

        if (!datos.token) {
            mensaje.textContent = "El servidor no devolvió el token de acceso.";
            return;
        }

        // Leer el contenido del token JWT
        const partesToken = datos.token.split(".");
        const payload = JSON.parse(atob(partesToken[1]));

        // Guardar el acceso
        localStorage.setItem("token", datos.token);
        localStorage.setItem("usuario", JSON.stringify(payload));

        // Redirigir según el rol del usuario
        if (payload.role === "admin") {
            window.location.href = "/admin/admin-dashboard.html";
        } else {
            window.location.href = "/usuario/usuario-dashboard.html";
        }

    } catch (error) {
        mensaje.textContent = "No se pudo conectar con el servidor.";
        console.error("Error de inicio de sesión:", error);
    }
});

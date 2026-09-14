const loginForm = document.getElementById("login-form");
const mensaje = document.getElementById("mensaje");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const respuesta = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.textContent = data.error;
            return;
        }

        // Guardamos el token
        localStorage.setItem("token", data.token);

        // Decodificamos el contenido del JWT
        const payload = JSON.parse(atob(data.token.split(".")[1]));

        // Guardamos el rol
        localStorage.setItem("role", payload.role);

        // Redirigimos según el rol
        if (payload.role === "admin") {
            window.location.href = "admin/admin-dashboard.html";
        } else {
            window.location.href = "usuario/usuario-dashboard.html";
        }

    } catch (error) {
        mensaje.textContent = "No se pudo conectar con el servidor";
        console.error(error);
    }
});
function setDataUserElement(user) {
    let dataUser = document.getElementById("data-user");

    if (dataUser) {
        dataUser.textContent = JSON.stringify(user, null, 2);
    }
}

async function fetchUser() {
    try {
        const respuesta = await fetch("http://localhost:3000/users");
        const data = await respuesta.json();

        setDataUserElement(data);

        console.log("data", data);
    } catch (error) {
        console.error("Error al obtener data:", error);
    }
}

fetchUser();
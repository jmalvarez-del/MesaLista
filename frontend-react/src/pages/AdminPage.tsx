import { useState } from "react";
import { useAuthContext } from "../context/authContext";
import { Reservations } from "../components/admin/Reservations";
import { Users } from "../components/admin/Users";

type Section = "inicio" | "reservas" | "usuarios";

export const AdminPage = () => {
  const [activeSection, setActiveSection] = useState<Section>("inicio");

  const { user, signOut } = useAuthContext();

  const menuItems = [
    { id: "inicio", name: "Inicio", icon: "⌂" },
    { id: "reservas", name: "Reservas", icon: "▣" },
    { id: "usuarios", name: "Usuarios", icon: "♙" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* BARRA LATERAL */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">

        <div className="px-6 py-7 border-b border-slate-700">
          <h1 className="text-2xl font-bold">
            MesaLista
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Panel administrativo
          </p>
        </div>

        <nav className="flex-1 px-4 py-6">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-4">
            Menú principal
          </p>

          <div className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as Section)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === item.id
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </div>
        </nav>

       <div className="px-6 py-5 border-t border-slate-700">
  <p className="text-sm font-semibold">
    {user?.name || "Administrador"}
  </p>

  <p className="text-xs text-slate-400 mt-1">
    Administrador
  </p>

  <button
    onClick={signOut}
    className="w-full mt-5 px-4 py-3 rounded-lg text-left text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors"
  >
    <span className="mr-3">↪</span>
    Cerrar sesión
  </button>
</div>
      </aside>



      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-8">

        <header className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800">
            {activeSection === "inicio" && "Inicio"}
            {activeSection === "reservas" && <Reservations />}
            {activeSection === "usuarios" && <Users />}
          </h2>

          <p className="text-gray-500 mt-2">
            Bienvenido al panel administrativo de MesaLista.
          </p>
        </header>

        {/* SECCIÓN INICIO */}
        {activeSection === "inicio" && (
          <section>
            <div className="bg-white rounded-xl shadow-sm p-7 border border-gray-200">
              <h3 className="text-xl font-semibold text-slate-800">
                Bienvenido, {user?.name || "Administrador"}
              </h3>

              <p className="text-gray-500 mt-2">
                Desde aquí puedes administrar las reservas y consultar
                los usuarios registrados en MesaLista.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-7">

              <button
                onClick={() => setActiveSection("reservas")}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-slate-800">
                  Gestionar reservas
                </h3>
                <p className="text-gray-500 text-sm mt-2">
                  Consultar y administrar las reservas del restaurante.
                </p>
                <span className="text-blue-600 text-sm font-semibold mt-5 inline-block">
                  Ir a reservas →
                </span>
              </button>

              <button
                onClick={() => setActiveSection("usuarios")}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-slate-800">
                  Gestionar usuarios
                </h3>
                <p className="text-gray-500 text-sm mt-2">
                  Consultar los usuarios registrados en el sistema.
                </p>
                <span className="text-blue-600 text-sm font-semibold mt-5 inline-block">
                  Ir a usuarios →
                </span>
              </button>

            </div>
          </section>
        )}
      </main>
    </div>
  );
};
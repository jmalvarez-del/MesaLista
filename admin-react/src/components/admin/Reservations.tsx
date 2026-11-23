export const Reservations = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Gestión de reservas
          </h2>

          <p className="text-gray-500 mt-2">
            Consulta y administra las reservas del restaurante.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-gray-500 text-sm">
              <th className="p-3">ID</th>
              <th className="p-3">Usuario</th>
              <th className="p-3">Mesa</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Hora</th>
              <th className="p-3">Personas</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td colSpan={8} className="text-center p-8 text-gray-400">
                Aquí aparecerán las reservas registradas.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
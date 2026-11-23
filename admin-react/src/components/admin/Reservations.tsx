import { useEffect, useState } from "react";
import { useAuthContext } from "../../context/authContext";

interface Reservation {
  id: number;
  userId: number;
  tableNumber: number;
  date: string;
  time: string;
  numberOfPeople: number;
  status: string;
}

export function Reservations() {
  const { token } = useAuthContext();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getReservations = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/reservations",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("No se pudieron cargar las reservas");
        }

        const data = await response.json();
        setReservations(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Ocurrió un error"
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      getReservations();
    }
  }, [token]);

  if (loading) {
    return <p className="p-6">Cargando reservas...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-600">{error}</p>;
  }

 return (
  <div className="min-h-full bg-slate-100 p-6">

    <div className="mb-6">
      <h2 className="text-3xl font-bold text-slate-800">
        Gestión de reservas
      </h2>

      <p className="mt-2 text-slate-600">
        Consulta y administra las reservas registradas en el restaurante.
      </p>
    </div>

    <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-xl">

      <div className="border-b border-slate-600 bg-slate-900 px-6 py-5">
        <h3 className="text-lg font-semibold text-white">
          Reservas registradas
        </h3>

        <p className="mt-1 text-sm text-slate-300">
          Total de reservas: {reservations.length}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">

          <thead className="bg-slate-700 text-sm uppercase text-slate-200">
            <tr>
              <th className="px-5 py-4">ID</th>
              <th className="px-5 py-4">Usuario</th>
              <th className="px-5 py-4">Mesa</th>
              <th className="px-5 py-4">Fecha</th>
              <th className="px-5 py-4">Hora</th>
              <th className="px-5 py-4">Personas</th>
              <th className="px-5 py-4">Estado</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-600">

            {reservations.map((reservation) => (
              <tr
                key={reservation.id}
                className="bg-slate-800 text-slate-100 transition-colors hover:bg-slate-700"
              >
                <td className="px-5 py-4 font-semibold text-white">
                  #{reservation.id}
                </td>

                <td className="px-5 py-4">
                  Usuario {reservation.userId}
                </td>

                <td className="px-5 py-4">
                  Mesa {reservation.tableNumber}
                </td>

                <td className="px-5 py-4">
                  {reservation.date}
                </td>

                <td className="px-5 py-4">
                  {reservation.time}
                </td>

                <td className="px-5 py-4 text-center">
                  {reservation.numberOfPeople}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                      reservation.status.toLowerCase() === "pendiente"
                        ? "bg-amber-500/20 text-amber-300"
                        : reservation.status.toLowerCase() === "confirmada"
                        ? "bg-green-500/20 text-green-300"
                        : reservation.status.toLowerCase() === "cancelada"
                        ? "bg-red-500/20 text-red-300"
                        : "bg-slate-600 text-slate-200"
                    }`}
                  >
                    {reservation.status}
                  </span>
                </td>
              </tr>
            ))}

            {reservations.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-10 text-center text-slate-300"
                >
                  No hay reservas registradas.
                </td>
              </tr>
            )}

          </tbody>
        </table>
      </div>
    </div>
  </div>
);
}
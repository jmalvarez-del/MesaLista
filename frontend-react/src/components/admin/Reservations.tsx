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
  user: {
    name: string;
    email: string;
  };
}

interface ReservationForm {
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
  const [actionError, setActionError] = useState("");
  const [editingReservation, setEditingReservation] =
    useState<Reservation | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<ReservationForm>({
    tableNumber: 1,
    date: "",
    time: "",
    numberOfPeople: 1,
    status: "pendiente",
  });

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

  // Abrir el formulario con los datos de la reserva seleccionada.
  const handleEdit = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setActionError("");

    setFormData({
      tableNumber: reservation.tableNumber,
      date: reservation.date,
      time: reservation.time.slice(0, 5),
      numberOfPeople: reservation.numberOfPeople,
      status: reservation.status,
    });
  };

  // Guardar los cambios de una reserva.
  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingReservation || !token) return;

    setSaving(true);
    setActionError("");

    try {
      const response = await fetch(
        `http://localhost:3000/reservations/${editingReservation.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: editingReservation.userId,
            tableNumber: Number(formData.tableNumber),
            date: formData.date,
            time: formData.time,
            numberOfPeople: Number(formData.numberOfPeople),
            status: formData.status,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "No se pudo actualizar la reserva");
      }

      setReservations((previousReservations) =>
        previousReservations.map((reservation) =>
          reservation.id === editingReservation.id
            ? { ...reservation, ...formData }
            : reservation
        )
      );

      setEditingReservation(null);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al actualizar"
      );
    } finally {
      setSaving(false);
    }
  };

  // Eliminar una reserva después de confirmar la acción.
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar esta reserva?"
    );

    if (!confirmed || !token) return;

    setActionError("");

    try {
      const response = await fetch(
        `http://localhost:3000/reservations/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "No se pudo eliminar la reserva");
      }

      setReservations((previousReservations) =>
        previousReservations.filter(
          (reservation) => reservation.id !== id
        )
      );

      if (editingReservation?.id === id) {
        setEditingReservation(null);
      }
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al eliminar"
      );
    }
  };

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

      {actionError && (
        <div className="mb-5 rounded-lg border border-red-300 bg-red-100 p-4 text-red-700">
          {actionError}
        </div>
      )}

      {/* Formulario de edición */}
      {editingReservation && (
        <div className="mb-6 rounded-xl border border-slate-300 bg-white p-6 shadow-lg">

          <h3 className="mb-5 text-xl font-bold text-slate-800">
            Editar reserva #{editingReservation.id}
          </h3>

          <form onSubmit={handleUpdate}>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block font-semibold text-slate-700">
                  Número de mesa
                </label>

                <input
                  type="number"
                  min="1"
                  required
                  value={formData.tableNumber}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      tableNumber: Number(event.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 p-3 text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold text-slate-700">
                  Fecha
                </label>

                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      date: event.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 p-3 text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold text-slate-700">
                  Hora
                </label>

                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      time: event.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 p-3 text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold text-slate-700">
                  Cantidad de personas
                </label>

                <input
                  type="number"
                  min="1"
                  required
                  value={formData.numberOfPeople}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      numberOfPeople: Number(event.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 p-3 text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold text-slate-700">
                  Estado de la reserva
                </label>

                <select
                  value={formData.status}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      status: event.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-800 outline-none focus:border-blue-500"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

            </div>

            <div className="mt-6 flex flex-wrap gap-3">

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>

              <button
                type="button"
                onClick={() => setEditingReservation(null)}
                disabled={saving}
                className="rounded-lg bg-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-300"
              >
                Cancelar
              </button>

            </div>
          </form>
        </div>
      )}

      {/* Tabla de reservas */}
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
                <th className="px-5 py-4">Acciones</th>
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
                    <div className="font-semibold text-white">
                      {reservation.user?.name || "Sin nombre"}
                    </div>

                    <div className="text-sm text-slate-400">
                      {reservation.user?.email || "Sin correo"}
                    </div>
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

                  <td className="px-5 py-4">
                    <div className="flex gap-2">

                      <button
                        type="button"
                        onClick={() => handleEdit(reservation)}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(reservation.id)}
                        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                      >
                        Eliminar
                      </button>

                    </div>
                  </td>
                </tr>
              ))}

              {reservations.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
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
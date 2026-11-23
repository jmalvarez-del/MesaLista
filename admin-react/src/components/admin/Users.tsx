import { useEffect, useState, type FormEvent } from "react";
import { useAuthContext } from "../../context/authContext";

interface User {
    id: number;
    name: string;
    age: number;
    email: string;
    role: string;
}

export const Users = () => {
    const { token } = useAuthContext();

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        age: "",
        email: "",
        role: "usuario"
    });

    // Consultar usuarios.
    useEffect(() => {
        const getUsers = async () => {
            try {
                const response = await fetch("http://localhost:3000/users", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error("No fue posible obtener los usuarios");
                }

                const data = await response.json();
                setUsers(data);

            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Error al consultar usuarios"
                );
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            getUsers();
        }
    }, [token]);

    // Preparar formulario de edición.
    const handleEdit = (user: User) => {
        setEditingUser(user);
        setActionError("");

        setFormData({
            name: user.name,
            age: String(user.age),
            email: user.email,
            role: user.role
        });
    };

    // Actualizar usuario.
    const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!editingUser) return;

        setSaving(true);
        setActionError("");

        try {
            const response = await fetch(
                `http://localhost:3000/users/${editingUser.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        age: Number(formData.age),
                        email: formData.email,
                        role: formData.role
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "No fue posible actualizar el usuario");
            }

            setUsers((previousUsers) =>
                previousUsers.map((user) =>
                    user.id === editingUser.id ? data.user : user
                )
            );

            setEditingUser(null);

        } catch (error) {
            setActionError(
                error instanceof Error
                    ? error.message
                    : "Error al actualizar el usuario"
            );
        } finally {
            setSaving(false);
        }
    };

    // Eliminar usuario.
    const handleDelete = async (id: number) => {
        const confirmDelete = window.confirm(
            "¿Estás seguro de que deseas eliminar este usuario?"
        );

        if (!confirmDelete) return;

        setDeletingId(id);
        setActionError("");

        try {
            const response = await fetch(
                `http://localhost:3000/users/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "No fue posible eliminar el usuario");
            }

            setUsers((previousUsers) =>
                previousUsers.filter((user) => user.id !== id)
            );

        } catch (error) {
            setActionError(
                error instanceof Error
                    ? error.message
                    : "Error al eliminar el usuario"
            );
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return <p className="text-white">Cargando usuarios...</p>;
    }

    if (error) {
        return <p className="text-red-400">{error}</p>;
    }

    return (
        <div className="p-6 text-white">
            <h2 className="text-2xl font-bold mb-6">
                Gestión de usuarios
            </h2>

            {actionError && (
                <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-300">
                    {actionError}
                </div>
            )}

            {/* Formulario de edición */}
            {editingUser && (
                <form
                    onSubmit={handleUpdate}
                    className="mb-8 rounded-xl border border-slate-700 bg-slate-900 p-6"
                >
                    <h3 className="mb-5 text-xl font-semibold">
                        Editar usuario #{editingUser.id}
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm text-gray-300">
                                Nombre
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value
                                    })
                                }
                                required
                                className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-white outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm text-gray-300">
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value
                                    })
                                }
                                required
                                className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-white outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm text-gray-300">
                                Edad
                            </label>
                            <input
                                type="number"
                                min="18"
                                max="120"
                                value={formData.age}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        age: e.target.value
                                    })
                                }
                                required
                                className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-white outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm text-gray-300">
                                Rol
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        role: e.target.value
                                    })
                                }
                                className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-white outline-none focus:border-blue-500"
                            >
                                <option value="usuario">Usuario</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? "Guardando..." : "Guardar cambios"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setEditingUser(null)}
                            disabled={saving}
                            className="rounded-lg bg-slate-700 px-5 py-2 font-medium text-white transition hover:bg-slate-600"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            {/* Tabla de usuarios */}
            {users.length === 0 ? (
                <p className="text-gray-400">
                    No hay usuarios registrados.
                </p>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-700 shadow-lg">
                    <table className="w-full border-collapse bg-slate-900 text-left">
                        <thead>
                            <tr className="bg-slate-800 text-gray-200">
                                <th className="p-4">ID</th>
                                <th className="p-4">Nombre</th>
                                <th className="p-4">Correo</th>
                                <th className="p-4">Edad</th>
                                <th className="p-4">Rol</th>
                                <th className="p-4">Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="border-t border-slate-700 text-gray-300 transition-colors hover:bg-slate-800"
                                >
                                    <td className="p-4">{user.id}</td>

                                    <td className="p-4 font-medium text-white">
                                        {user.name}
                                    </td>

                                    <td className="p-4">{user.email}</td>

                                    <td className="p-4">{user.age}</td>

                                    <td className="p-4">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                user.role === "admin"
                                                    ? "bg-blue-500/20 text-blue-300"
                                                    : "bg-emerald-500/20 text-emerald-300"
                                            }`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>

                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                                            >
                                                Editar
                                            </button>

                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                disabled={deletingId === user.id}
                                                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                                            >
                                                {deletingId === user.id
                                                    ? "Eliminando..."
                                                    : "Eliminar"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
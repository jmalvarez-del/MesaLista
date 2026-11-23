import { useEffect, useState } from "react";
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

    if (loading) {
        return <p className="text-white">Cargando usuarios...</p>;
    }

    if (error) {
        return <p className="text-red-400">{error}</p>;
    }

    return (
    <div className="p-6 text-white">
        <h2 className="text-2xl font-bold mb-6 text-white">
            Gestión de usuarios
        </h2>

        {users.length === 0 ? (
            <p className="text-gray-400">
                No hay usuarios registrados.
            </p>
        ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-700 shadow-lg">
                <table className="w-full text-left border-collapse bg-slate-900">
                    <thead>
                        <tr className="bg-slate-800 text-gray-200">
                            <th className="p-4">ID</th>
                            <th className="p-4">Nombre</th>
                            <th className="p-4">Correo</th>
                            <th className="p-4">Edad</th>
                            <th className="p-4">Rol</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.map((user) => (
                            <tr
                                key={user.id}
                                className="border-t border-slate-700 text-gray-300 hover:bg-slate-800 transition-colors"
                            >
                                <td className="p-4">{user.id}</td>
                                <td className="p-4 font-medium text-white">
                                    {user.name}
                                </td>
                                <td className="p-4">{user.email}</td>
                                <td className="p-4">{user.age}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        user.role === "admin"
                                            ? "bg-blue-500/20 text-blue-300"
                                            : "bg-emerald-500/20 text-emerald-300"
                                    }`}>
                                        {user.role}
                                    </span>
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
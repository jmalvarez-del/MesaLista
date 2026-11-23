

import { useState } from "react";
import { useAuthContext } from "../context/authContext";

export const LoginPage = () => {
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");

  const { isChecking, isAuthenticated, user, signIn } = useAuthContext();

  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center h-dvh bg-gray-100">
        <div className="bg-white p-10 rounded-2xl shadow-lg text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Verificando usuario
          </h1>
          <p className="text-gray-500 mt-3">
            Por favor, espera un momento...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-dvh bg-gray-100 p-6">
      {isAuthenticated ? (
        <div className="bg-white p-10 rounded-2xl shadow-lg text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Bienvenido {user?.name}
          </h1>
          <p className="text-gray-500 mt-3">
            Correo: {user?.email}
          </p>
          <p className="text-green-600 font-semibold mt-5">
            Acceso administrativo concedido
          </p>
        </div>
      ) : (
        <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">
              MesaLista
            </h1>
            <p className="text-gray-500 mt-2">
              Panel de administración
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Correo electrónico
              </label>
              <input
                value={inputEmail}
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-400"
                type="email"
                placeholder="admin@mesalista.com"
                onChange={(e) => setInputEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Contraseña
              </label>
              <input
                value={inputPassword}
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-400"
                type="password"
                placeholder="Ingresa tu contraseña"
                onChange={(e) => setInputPassword(e.target.value)}
              />
            </div>

            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold p-3 rounded-lg transition-colors"
              onClick={() => signIn(inputEmail, inputPassword)}
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

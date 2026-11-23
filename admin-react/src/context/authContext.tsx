import {
  createContext,
  type PropsWithChildren,
  useContext,
  useState,
} from "react";
type AuthStatus = "checking" | "authenticated" | "unauthenticated";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  status: AuthStatus;
  token?: string;
  user?: User;
  error?: string;
  isAuthenticated: boolean;
  isChecking: boolean;
  signIn: (email: string, password: string) => Promise<void>;
}
export const AuthContext = createContext({} as AuthState);
export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [status, setStatus] = useState<AuthStatus>("unauthenticated");
  const [user, setUser] = useState<User>();
  const [error, setError] = useState<string>();
  const [token, setToken] = useState<string>();

async function signIn(email: string, password: string): Promise<void> {
  setStatus("checking");
  setError(undefined);

  try {
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al iniciar sesión");
    }

    if (data.user.role !== "admin") {
      setUser(undefined);
      setToken(undefined);
      setStatus("unauthenticated");
      setError("No tienes permisos de administrador.");
      return;
    }

    setUser(data.user);
    setToken(data.token);
    setStatus("authenticated");

  } catch (error) {
    setUser(undefined);
    setToken(undefined);
    setStatus("unauthenticated");

    setError(
      error instanceof Error
        ? error.message
        : "Error al iniciar sesión"
    );
  }
}
  return (
    <AuthContext.Provider
      value={{
  status: status,
  isChecking: status === "checking",
  isAuthenticated: status === "authenticated",
  user,
  signIn,
  error,
  token,
    }}
    >
      {children}
    </AuthContext.Provider>
  );
};


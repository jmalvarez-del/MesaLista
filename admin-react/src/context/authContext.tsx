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

function signIn(email: string, password: string) {
  const usersFound = USERS.filter(
    (value) => email === value.email && password === value.password,
  );

  setError(undefined);
  setStatus("checking");

  if (usersFound.length > 0) {
    setUser(usersFound[0]);
    setTimeout(() => setStatus("authenticated"), 3000);
  } else {
    setTimeout(() => {
      setStatus("unauthenticated");
      setError("Correo o contraseña incorrectos.");
    }, 3000);
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
    }}
    >
      {children}
    </AuthContext.Provider>
  );
};


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
  password: string;
}

interface AuthState {
  status: AuthStatus;
  token?: string;
  user?: User;
  isAuthenticated: boolean;
  isChecking: boolean;
}
export const AuthContext = createContext({} as AuthState);
export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [status, setStatus] = useState<AuthStatus>("unauthenticated");

  return (
    <AuthContext.Provider
      value={{
        status: status,
        isChecking: status === "checking",
        isAuthenticated: status === "authenticated",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
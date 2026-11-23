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
  signIn: (email: string, password: string) => void;
}
const USERS: User[] = [
  {
    id: 1,
    name: "Administrador",
    email: "admin@mesalista.com",
    password: "123456",
  },
];
export const AuthContext = createContext({} as AuthState);
export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [status, setStatus] = useState<AuthStatus>("unauthenticated");
  const [user, setUser] = useState<User>();

function signIn(email: string, password: string) {
  const usersFound = USERS.filter(
    (value) => email === value.email && password === value.password,
  );

  setStatus("checking");

  if (usersFound.length > 0) {
    setUser(usersFound[0]);
    setTimeout(() => setStatus("authenticated"), 3000);
  } else {
    setTimeout(() => setStatus("unauthenticated"), 3000);
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
    }}
    >
      {children}
    </AuthContext.Provider>
  );
};


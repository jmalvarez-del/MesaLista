import "./App.css";
import { AuthProvider, useAuthContext } from "./context/authContext";
import { LoginPage } from "./pages/LoginPage";
import { AdminPage } from "./pages/AdminPage";

function AppContent() {
  const { isAuthenticated, isChecking } = useAuthContext();

  if (isChecking) {
    return <p>Verificando usuario...</p>;
  }

  return isAuthenticated ? <AdminPage /> : <LoginPage />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
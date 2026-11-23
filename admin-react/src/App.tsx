
import "./App.css";
import { AuthProvider } from "./context/authContext";
import { LoginPage } from "./pages/LoginPage";

function App() {
  return (
    <>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </>
  );
}

export default App;

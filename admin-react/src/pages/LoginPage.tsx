import  { useAuthContext }  from "../context/authContext";

export const LoginPage = () => {
  const { status, isChecking, user } = useAuthContext();

  if (isChecking) {
    return (
      <div>
        <h1>Verificando usuario</h1>
      </div>
    );
  }

  return (
    <>
      <h1>LoginPage</h1>
    </>
  );
};
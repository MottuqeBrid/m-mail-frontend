import { useEffect, useState } from "react";
import { AuthContext } from "./authContext";
import useAxios from "../hooks/useAxios";

// 2. Create the provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const app = useAxios();

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await app.get("user/me");
        setUser(data?.user || null);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, [app]);

  // Provide user state and functions to the rest of the app
  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

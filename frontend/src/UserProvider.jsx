
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setLogout } from "./api/apiFetch";
import { mergeCart } from "./api/cartApi";

const UserContext = createContext(null);

export default function UserProvider ({children})
{
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

  const navigate = useNavigate();

  const login = async (data) => {
    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
    if (data.access_id === 1) { await mergeCart(data.token); }
  };

  const logout = (reason) => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login", {state: { reason }});
  }

  useEffect(() => {
    setLogout(logout);    
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useAuth() 
{
  return useContext(UserContext);
}

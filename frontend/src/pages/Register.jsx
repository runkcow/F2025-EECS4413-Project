
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../UserProvider";
import useUserApi from "../api/userApi";

export default function Register()
{
  const { login } = useAuth();
  
  const { addUser, getUserLogin } = useUserApi();

  const navigate = useNavigate();

  const location = useLocation();
  const returnUrl = location.state?.returnUrl || `/`;

  const [userData, setUserData] = useState({
    id: 1,
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    access_id: 1
  });

  const [error, setError] = useState("");

  const handleUserData = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "access") { setUserData((prev) => ({ ...prev, access_id: checked ? 2 : 1 })); } 
    else { setUserData((prev) => ({ ...prev, [name]: value })); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const id = await addUser(userData);
      // immediately attempt logging in after registering user
      const res = await getUserLogin(userData.username, userData.password);
      if (res.success)
      {
        setError("");
        await login({ token: res.token, ...res.user });
        navigate(returnUrl);
      }
      else { setError(res.error); }
    } catch (err) {
      console.error(err);
      setError("Register failed");
    }
  };

  const { authLoading } = useAuth();

  if (authLoading) { return <FullPageLoader message="Signing in..." />; }
  
  return (
    <div className="info-wrapper" style={{height:"80vh"}}>
      <form className="info-class" onSubmit={handleRegister}>
        <div className="info-input">Username: <input type="text" name="username" value={userData.username} onChange={handleUserData} required /></div>
        <div className="info-input">Password: <input type="password" name="password" value={userData.password} onChange={handleUserData} required /></div>
        <div className="info-input">First Name: <input type="text" name="first_name" value={userData.first_name} onChange={handleUserData} required /></div>
        <div className="info-input">Last Name: <input type="text" name="last_name" value={userData.last_name} onChange={handleUserData} required /></div>
        <div className="info-input">Phone Number: <input type="number" name="phone_number" value={userData.phone_number} onChange={handleUserData} required /></div>
        <div className="info-input">Email: <input type="text" name="email" value={userData.email} onChange={handleUserData} required /></div>
        <div style={{display:"flex", flexDirection:"row", justifyContent:"space-around", alignItems:"center"}}>
          <div>User <input type="radio" name="access" checked={userData.access_id === 1} onChange={handleUserData} /></div>
          <div>Admin <input type="radio" name="access" checked={userData.access_id === 2} onChange={handleUserData} /></div>
        </div>
        <button className="btn" type="submit">Register</button>
        {error && <p style={{color:"red"}}>{error}</p>}
      </form>
    </div>
  );
}
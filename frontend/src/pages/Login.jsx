
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../UserProvider";
import useUserApi from "../api/userApi";

export default function Login()
{
  const { login } = useAuth();
  
  const { getUserLogin } = useUserApi();

  const navigate = useNavigate();

  const location = useLocation();
  const returnUrl = location.state?.returnUrl || `/`;
  const reason = location.state?.reason || "";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await getUserLogin(username, password);
      if (res.success)
      {
        setError("");
        await login({ token: res.token, ...res.user });
        navigate(returnUrl);
      }
      else { setError(res.error); }
    } catch (err) {
      console.error(err);
      setError("Login failed");
    }
  }

  // TODO: hard setting on height probably isn't good
  return (
    <div className="info-wrapper" style={{height:"80vh"}}>
      <form className="info-class" onSubmit={handleLogin}>
        {reason && (<span style={{color:"red"}}>{reason}</span>)}
        <div className="info-input">Username: <input type="text" name="username" value={username} onChange={(e) => setUsername(e.target.value)} required /></div>
        <div className="info-input">Password: <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        <button className="btn" type="submit">Login</button>
        {error && <p style={{color:"red"}}>{error}</p>}
        <a onClick={() => navigate("/register", { state: { returnUrl: returnUrl } })}>Register an account</a>
      </form>
    </div>
  );
}

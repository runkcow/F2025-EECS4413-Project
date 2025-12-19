
import { Link } from "react-router-dom";
import { useAuth } from "../UserProvider";

export default function Navbar()
{
  const { user, logout } = useAuth(); 

  return (
    <nav className="navbar">
      <div className="navbar-left" style={{display:"flex", flexDirection:"row", height:"100%"}}>
        <img style={{height:"50px"}} src="/icon.svg" alt="Logo" />
        {user !== null ? (
          <div className="navbar-content" style={{display:"flex", height:"100%", maxWidth:"700px", justifyContent:"center", alignItems:"center"}}><span style={{fontSize:"20px"}}>Welcome, {user.first_name} {user.last_name}</span></div>
        ) : null }
      </div>
      <div className="navbar-right" style={{flexShrink:"0"}}>
        <Link className="btn navbar-content" to="/">Products</Link>
        {(user === null || user.access_id === 1) && (<Link className="btn navbar-content" to="/cart">Cart</Link>)}
        {user !== null ? (
          <>
            {user.access_id === 2 && (<Link className="btn navbar-content" to="/users">Users</Link>)}
            <Link className="btn navbar-content" to="/orders">Orders</Link>
            <Link className="btn navbar-content" to={`/settings/${user.id}`}>Settings</Link>
            <button className="btn navbar-content" onClick={() => { logout(); }}>Log Out</button>
          </>
        ) : (
          <Link className="btn navbar-content" to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}
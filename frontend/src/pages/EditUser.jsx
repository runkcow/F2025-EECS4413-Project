
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../UserProvider";
import useUserApi from "../api/userApi";

// add some finish variable that returns to the previous url

export default function User()
{
  const { getUserById, updateUser } = useUserApi();

  const { user, setUser } = useAuth();

  const navigate = useNavigate();

  const { id } = useParams();
  const userId = parseInt(id);

  if (!user || (user.id !== userId && user.access_id !== 2)) { return (<p>No Permission</p>); }

  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
  });
  const [error, setError] = useState("");

  // initialize userData
  useEffect(() => {
    async function init() {
      const data = await getUserById(userId);
      const newData = {
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number,
        email: data.email
      }
      setUserData(newData);
    }
    init();
  }, [userId]);

  const handleUserData = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(userId, userData);
      if (userId === user.id)
      {
        const newUser = {
          ...user,
          ...{ first_name: userData.first_name, last_name: userData.last_name }
        };
        setUser(newUser);
      }
      navigate(`/settings/${userId}`);
    } catch (err) {
      console.error(err);
      setError("Update failed");
    }
  }

  return (
    <div className="info-wrapper" style={{height:"80vh"}}>
      <form className="info-class" onSubmit={handleEditSubmit}>
        <div className="info-input">First Name: <input type="text" name="first_name" value={userData.first_name} onChange={handleUserData} required /></div>
        <div className="info-input">Last Name: <input type="text" name="last_name" value={userData.last_name} onChange={handleUserData} required /></div>
        <div className="info-input">Phone Number: <input type="number" name="phone_number" value={userData.phone_number} onChange={handleUserData} required /></div>
        <div className="info-input">Email: <input type="text" name="email" value={userData.email} onChange={handleUserData} required /></div>
        <div style={{display:"flex", flexDirection:"row"}}>
          <button className="btn" style={{width:"100%", margin:"0 8px 0 0"}} type="button" onClick={() => navigate(`/settings/${userId}`)}>Cancel</button>
          <button className="btn" style={{width:"100%", margin:"0 0 0 8px"}} type="submit">Save</button>
        </div>
        {error && <p style={{color:"red"}}>{error}</p>}
      </form>
    </div>
  );
}


import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../UserProvider";
import useUserApi from "../api/userApi";

export default function Password()
{
  const { getUserById, getUserLogin, updateUser } = useUserApi();

  const { user } = useAuth();

  const navigate = useNavigate();

  const { id } = useParams();
  const userId = parseInt(id);

  if (!user || (user.id !== userId && user.access_id !== 2)) { return (<p>No Permission</p>); }

  const [userData, setUserData] = useState({
    username: ""
  });
  const [error, setError] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // init
  useEffect(() => {
    async function init() {
      const data = await getUserById(userId);
      const newData = {
        username: data.username
      };
      setUserData(newData);
    }
    init();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let id = await getUserLogin(userData.username, oldPassword);
      if (id !== 0)
      {
        setError("");
        updateUser(userId, { password: newPassword });
        navigate(`/settings/${userId}`);
      }
      else { setError("Incorrect credentials"); }
    } catch (err) {
      console.error(err);
      setError("Failed changing password");
    }
  };

  return (
    <div className="info-wrapper" style={{height:"80vh"}}>
      <form className="info-class" onSubmit={handleSubmit}>
        <div className="info-input">Old Password:<input type="password" name="oldpassword" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required /></div>
        <div className="info-input">New Password:<input type="password" name="newpassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required /></div>
        <div style={{display:"flex", flexDirection:"row"}}>
          <button className="btn" style={{width:"100%", margin:"0 8px 0 0"}} type="button" onClick={() => navigate(`/settings/${userId}`)}>Cancel</button>
          <button className="btn" style={{width:"100%", margin:"0 0 0 8px"}} type="submit">Save</button>
        </div>
      </form>
      {error && <p style={{color:"red"}}>{error}</p>}
    </div>
  );
}

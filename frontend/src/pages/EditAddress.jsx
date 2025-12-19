
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../UserProvider";
import useUserApi from "../api/userApi";

export default function Address()
{
  const { getAddressById, addAddress, updateAddress, deleteAddress } = useUserApi();

  const { user } = useAuth();

  const navigate = useNavigate();

  const { id, aid } = useParams();
  const userId = parseInt(id);
  const addressId = aid !== undefined ? parseInt(aid) : null;

  if (!user || (user.id !== userId && user.access_id !== 2)) { return (<p>No Permission</p>); }

  const location = useLocation();
  const returnUrl = location.state?.returnUrl || `/settings/${userId}`;

  const [addressData, setAddressData] = useState({
    street: "",
    city: "",
    province: "",
    country: "",
    zip_code: "",
    user_id: userId
  });
  const [error, setError] = useState("");

  // initialize if not new
  useEffect(() => {
    async function init() {
      const data = await getAddressById(addressId);
      const newData = {
        ...addressData,
        ...data
      };
      setAddressData(newData);
    }
    if (addressId !== null) { init(); }
  }, [addressId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddressData((p) => ({...p, [name]:value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (addressId !== null) { await updateAddress(addressId, addressData); }
      else { await addAddress(addressData); }
      navigate(returnUrl);
    } catch (err) {
      console.error(err);
      setError("Update failed");
    }
  };

  const handleDelete = async (e) => {
    // only happen if editing
    e.preventDefault();
    if (addressId === null) { return; }
    try {
      await deleteAddress(addressId);
      navigate(returnUrl);
    } catch (err) {
      console.error(err);
      setError("Deletion failed");
    }
  }

  return (
    <div className="info-wrapper" style={{height:"80vh"}}>
      <form className="info-class" onSubmit={handleSubmit}>
        <div className="info-input">Street: <input type="text" name="street" value={addressData.street} onChange={handleChange} required /></div>
        <div className="info-input">City: <input type="text" name="city" value={addressData.city} onChange={handleChange} required /></div>
        <div className="info-input">Province: <input type="text" name="province" value={addressData.province} onChange={handleChange} required /></div>
        <div className="info-input">Country: <input type="text" name="country" value={addressData.country} onChange={handleChange} required /></div>
        <div className="info-input">Zip Code: <input type="text" name="zip_code" value={addressData.zip_code} onChange={handleChange} required /></div>
        <div style={{display:"flex", flexDirection:"row"}}>
          <button className="btn" style={{width:"100%", margin:"0 8px 0 0"}} type="button" onClick={() => navigate(returnUrl)}>Cancel</button>
          <button className="btn" style={{width:"100%", margin:"0 0 0 8px"}} type="submit">Save</button>
        </div>
        {error && <p style={{color:"red"}}>{error}</p>}
        {addressId !== null && <button className="btn" style={{margin:"8px 0 0 0", color:"red"}} type="button" onClick={handleDelete}>Delete Address</button>}
      </form>
    </div>
  );
}

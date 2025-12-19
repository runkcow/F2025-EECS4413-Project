
import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../UserProvider";
import useUserApi from "../api/userApi";

import AddressCard from "../components/AddressCard";
import PaymentCard from "../components/PaymentCard";

export default function Settings()
{
  const { getAddressByUserId, getPaymentByUserId, getUserById, softDeleteUser } = useUserApi();

  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const { id } = useParams();
  const userId = parseInt(id);

  if (!user || (user.id !== userId && user.access_id !== 2)) { return (<p>No Permission</p>); }

  const location = useLocation();
  const returnUrl = location.state?.returnUrl || `/`;

  const [userData, setUserData] = useState({});
  useEffect(() => {
    getUserById(userId).then(setUserData);
  }, [id]); 

  const [error, setError] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [payments, setPayments] = useState([]);

  // initialize addresses & payments
  useEffect(() => {
    getAddressByUserId(userId).then(setAddresses);
    getPaymentByUserId(userId).then(setPayments);
  }, [id]);

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete your account? This cannot be undone.");
    if (!confirmed) return;
    try {
      await softDeleteUser(userId);
      if (user.id === userId) { logout(); }
      navigate(returnUrl)
    } catch (err) {
      console.error(err);
      setError("Deletion failed");
    }
  }

  return (
    <div className="info-wrapper" style={{height:"80vh"}}>
      <div className="info-class">
        <h2>User Details</h2>
        <div className="info-input"><span className="fspan">Username:</span><span>{userData.username}</span></div>
        <div className="info-input"><span className="fspan">First Name:</span><span>{userData.first_name}</span></div>
        <div className="info-input"><span className="fspan">Last Name:</span><span>{userData.last_name}</span></div>
        <div className="info-input"><span className="fspan">Phone Number:</span><span>{userData.phone_number}</span></div>
        <div className="info-input"><span className="fspan">Email:</span><span>{userData.email}</span></div>
        <div style={{display:"flex", flexDirection:"row"}}>
          <Link className="btn" style={{width:"100%", margin:"0 8px 0 0"}} to={`/password/${userId}`}>Change Password</Link>
          <Link className="btn" style={{width:"100%", margin:"0 0 0 8px"}} to={`/user/${userId}`}>Edit User Settings</Link>
        </div>
        {userData.access_id === 1 && (
          <>
            <h2>Addresses</h2>
            {addresses.length === 0 && <p>No addresses found.</p>}
            {addresses.map((a) => (
              <AddressCard key={a.id} address={a} options={{ to:`/address/${userId}/${a.id}` }} />
            ))}
            {addresses.length < 5 && (<Link className="btn" to={`/address/${userId}/new`}>Add New Address</Link>)}
            <h2>Payments</h2>
            {payments.length === 0 && <p>No payment methods found.</p>}
            {payments.map((a) => (
              <PaymentCard key={a.id} payment={a} options={{ to:`/payment/${userId}/${a.id}` }} />
            ))}
            {payments.length < 5 && (<Link className="btn" to={`/payment/${userId}/new`}>Add New Payment Method</Link>)}
          </>
        )}
        <button className="btn" style={{margin:"8px 0 0 0", color:"red"}} onClick={handleDelete}>Delete Account</button>
        {error && <p style={{color:"red"}}>{error}</p>}
      </div>
    </div>
  );
}

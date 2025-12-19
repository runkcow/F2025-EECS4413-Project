
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../UserProvider";
import useUserApi from "../api/userApi";

export default function Payment()
{
  const { getPaymentById, addPayment, updatePayment, deletePayment } = useUserApi();

  const { user } = useAuth();

  const navigate = useNavigate();

  const { id, pid } = useParams();
  const userId = parseInt(id);
  const paymentId = pid !== undefined ? parseInt(pid) : null;

  if (!user || (user.id !== userId && user.access_id !== 2)) { return (<p>No Permission</p>); }

  const location = useLocation();
  const returnUrl = location.state?.returnUrl || `/settings/${userId}`;

  const [paymentData, setPaymentData] = useState({
    type: "",
    last4_digits: 0,
    expiry_date: "",
    provider: "",
    user_id: userId
  });
  const [error, setError] = useState("");

  // initialize if not new
  useEffect(() => {
    async function init() {
      const data = await getPaymentById(paymentId);
      const newData = {
        ...paymentData,
        ...data
      };
      setPaymentData(newData);
    }
    if (paymentId !== null) { init(); }
  }, [paymentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((p) => ({...p, [name]:value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (paymentId !== null) { await updatePayment(paymentId, paymentData); }
      else { await addPayment(paymentData); }
      navigate(returnUrl);
    } catch (err) {
      console.error(err);
      setError("Update failed");
    }
  };

  const handleDelete = async (e) => {
    // only happen if editing
    e.preventDefault();
    if (paymentId === null) { return; }
    try {
      await deletePayment(paymentId);
      navigate(returnUrl);
    } catch (err) {
      console.error(err);
      setError("Deletion failed");
    }
  }

  return (
    <div className="info-wrapper" style={{height:"80vh"}}>
      <form className="info-class" onSubmit={handleSubmit}>
        <div className="info-input">Type: <input type="text" name="type" value={paymentData.type} onChange={handleChange} required /></div>
        <div className="info-input">Card Number: <input type="number" name="last4_digits" value={paymentData.last4_digits} onChange={handleChange} required /></div>
        <div className="info-input">Expiry Date: <input type="text" name="expiry_date" value={paymentData.expiry_date} onChange={handleChange} required /></div>
        <div className="info-input">Provider: <input type="text" name="provider" value={paymentData.provider} onChange={handleChange} required /></div>
        <div style={{display:"flex", flexDirection:"row"}}>
          <button className="btn" style={{width:"100%", margin:"0 8px 0 0"}} type="button" onClick={() => navigate(returnUrl)}>Cancel</button>
          <button className="btn" style={{width:"100%", margin:"0 0 0 8px"}} type="submit">Save</button>
        </div>
        {error && <p style={{color:"red"}}>{error}</p>}
        {paymentId !== null && <button className="btn" style={{margin:"8px 0 0 0", color:"red"}} type="button" onClick={handleDelete}>Delete Payment</button>}
      </form>
    </div>
  );
}


import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../UserProvider";
import useOrdersApi from "../api/ordersApi";

export default function Summary()
{
  const { getOrderById } = useOrdersApi();

  const { user } = useAuth();

  const { id } = useParams();
  const order_id = parseInt(id);

  const [access, setAccess] = useState(false);
  const [orderData, setOrderData] = useState([]);
  const [sum, setSum] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const orders = await getOrderById(order_id);
        if (user && (user.access_id === 2 || user.id === orders[0].user_id)) { setAccess(true); }
        setOrderData(orders);
        let s = 0;
        for (const O of orders) { s += O.qty * O.product_price; }
        setSum(s);
      } catch (err) {
        console.log("Failed to load summary:", err);
      }
    })();
  }, []);

  if (!access) { return (<p>No Permission</p>) }

  return (
    <div className="info-wrapper">
      <div className="info-class">
        <h2>Overview</h2>
        <div className="info-input"><span className="fspan">Order ID:</span><span>{orderData[0].id}</span></div>
        <div className="info-input"><span className="fspan">User:</span><span>{orderData[0].username}</span></div>
        <div className="info-input"><span className="fspan">Date & Time:</span><span>{orderData[0].datetime}</span></div>
        <h2>Items</h2>
        {orderData.map((a) => (
          <div key={a.product_id} className="info-input">
            <span>{a.qty} x {a.product_name}</span>
            <span className="fspan">${a.qty * a.product_price}</span>
          </div>
        ))}
        <hr style={{width: "100%"}} />
        <div className="info-input"><span className="fspan">Total:</span><span>${sum.toFixed(2)}</span></div>
        <h2>Shipping Address</h2>
        <div className="info-input"><span className="fspan">Street:</span><span>{orderData[0].shipping_street}</span></div>
        <div className="info-input"><span className="fspan">City:</span><span>{orderData[0].shipping_city}</span></div>
        <div className="info-input"><span className="fspan">Province:</span><span>{orderData[0].shipping_province}</span></div>
        <div className="info-input"><span className="fspan">Country:</span><span>{orderData[0].shipping_country}</span></div>
        <div className="info-input"><span className="fspan">Zip Code:</span><span>{orderData[0].shipping_zip_code}</span></div>
        <h2>Payment Method</h2>
        <div className="info-input"><span className="fspan">Type:</span><span>{orderData[0].payment_type}</span></div>
        <div className="info-input"><span className="fspan">Number:</span><span>**** {orderData[0].payment_last4_digits}</span></div>
        <div className="info-input"><span className="fspan">Expiry:</span><span>{orderData[0].payment_expiry_date}</span></div>
        <div className="info-input"><span className="fspan">Provider:</span><span>{orderData[0].payment_provider}</span></div>
        <Link className="btn" style={{margin:"8px 0 0 0"}} to="/orders">To Orders</Link>
      </div>
    </div>
  );
}
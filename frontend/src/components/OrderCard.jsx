
import { Link, useNavigate } from "react-router-dom";

export default function OrderCard ({order, updateInput})
{
  const navigate = useNavigate();

  return (
    <div className="product-card">
      <img 
        className="product-image"
        src={order.product_url} 
        alt={order.product_name} 
        onClick={() => navigate(`/product/${order.product_id}`)}
      />
      <div className="product-info">
        <div className="product-text">
          <h3><span className="interact-text" onClick={() => {updateInput(`product:${order.product_name}`)}}>{order.qty} x {order.product_name}</span></h3>
          {/* TODO: make this not terrible */}
          <div style={{display:"flex", flexDirection:"row", flex:"1", minWidth:"0"}}>
            <span style={{margin:"0 8px 0 0", maxWidth:"280px"}}>
              <span className="interact-text" onClick={() => {updateInput(`order:${order.id}`)}}>Order ID: {order.id}</span><br/>
              <span className="interact-text" onClick={() => {updateInput(`user:${order.username}`)}}>Ordered by: {order.username}</span><br/>
              <span className="fspan">Date:</span> <span>{order.datetime}</span><br/>
            </span>
            <span style={{margin:"0 8px 0 8px", maxWidth:"280px"}}>
              Shipped to:<br/>
              <span>{`${order.shipping_street}`}</span><br/>
              <span>{`${order.shipping_city} ${order.shipping_province} ${order.shipping_zip_code}`}</span>
            </span>
            <span style={{margin:"0 0 0 8px", maxWidth:"280px"}}>
              Paid with:<br/>
              <span>{`${order.payment_type} **** ${order.payment_last4_digits} Expires ${order.payment_expiry_date}`}</span><br/>
              <span>{`${order.payment_provider}`}</span>
            </span>
          </div>
        </div>
        <div className="product-payment">
          <span style={{fontSize:"24px"}}>Total: ${order.qty * order.product_price}</span>
          <Link className="btn" to={`/summary/${order.id}`}>Order Summary</Link>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../UserProvider";
import useUserApi from "../api/userApi";
import useCartApi from "../api/cartApi";
import useCatalogApi from "../api/catalogApi";
import useOrdersApi from "../api/ordersApi";

import AddressCard from "../components/AddressCard";
import PaymentCard from "../components/PaymentCard";

export default function Checkout()
{
  const { user } = useAuth();
  if (user.access_id !== 1) { return (<p>No Permission.</p>) }

  const { getAddressByUserId, getPaymentByUserId } = useUserApi();
  const { getCartByUserId } = useCartApi();
  const { getProducts } = useCatalogApi();
  const { checkout } = useOrdersApi();

  const navigate = useNavigate();

  const [sum, setSum] = useState(0);
  const [cartData, setCartData] = useState({});
  const [productData, setProductData] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getAddressByUserId(user.id).then(setAddresses);
    getPaymentByUserId(user.id).then(setPayments);
    (async () => {
      const cart_items = await getCartByUserId();
      if (Object.keys(cart_items).length === 0) { throw new Error("NO CART ITEMS"); }
      setCartData(cart_items);
      const products = await getProducts({ id: Object.keys(cart_items) });
      setProductData(products);
      let s = 0.0;
      for (const P of products) { s += cart_items[P.id] * P.price; }
      setSum(s);
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedAddress === null) { setError("Select an address"); }
    if (selectedPayment === null) { setError("Select a payment"); }
    const address = addresses.find((a) => a.id === selectedAddress);
    const payment = payments.find((a) => a.id === selectedPayment);
    try {
      const res = await checkout(address, payment);
      if (res.success) { navigate(`/summary/${res.orderId}`); }
      else { setError(res.error); }
    } catch (err) {
      console.log(err);
      setError("Checkout failed");
    }
  };

  return (
    <div className="info-wrapper">
      <form className="info-class" onSubmit={handleSubmit}>
        <h2>Items</h2>
        {productData.map((a) => (
          <div key={a.id} className="info-input">
            <span>{cartData[a.id]} x {a.name}</span>
            <span className="fspan">${cartData[a.id] * a.price}</span>
          </div>
        ))}
        <hr style={{width: "100%"}} />
        <div className="info-input"><span>Total:</span><span>${sum.toFixed(2)}</span></div>
        <h2>Shipping Address</h2>
        {addresses.length === 0 && <p>No addresses found.</p>}
        {addresses.map((a) => (
          <label key={a.id} style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
            <input style={{width:"48px", flexShrink:"0"}} type="radio" name="address" value={a.id} checked={selectedAddress === a.id} onChange={() => setSelectedAddress(a.id)} />
            <div style={{flex:"1", minWidth:"0"}}><AddressCard key={a.id} address={a} options={{ to:`/address/${user.id}/${a.id}`, state:{ returnUrl: "/checkout" } }} /></div>
          </label>
        ))}
        {addresses.length < 5 && (<Link className="btn" style={{margin:"0px"}} to={`/address/${user.id}/new`} state={{ returnUrl: "/checkout" }}>Add New Address</Link>)}
        <h2>Payment Method</h2>
        {payments.length === 0 && <p>No payment methods found.</p>}
        {payments.map((a) => (
          <label key={a.id} style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
            <input style={{width: "48px", flexShrink:"0"}} type="radio" name="payment" value={a.id} checked={selectedPayment === a.id} onChange={() => setSelectedPayment(a.id)} />
            <div style={{flex:"1", minWidth:"0"}}><PaymentCard key={a.id} payment={a} options={{ to:`/payment/${user.id}/${a.id}`, state:{ returnUrl: "/checkout" } }} /></div>
          </label>
        ))}
        {payments.length < 5 && (<Link className="btn" to={`/payment/${user.id}/new`} state={{ returnUrl: "/checkout" }}>Add New Payment Method</Link>)}
        <div style={{display:"flex", flexDirection:"row", margin:"8px 0"}}>
          <Link className="btn" style={{width:"100%", margin:"0 8px 0 0"}} to={`/cart`}>Cancel</Link>
          <button className="btn" type="submit" style={{width:"100%", margin:"0 0 0 8px"}}>Finish Order</button>
        </div>
        <span style={{fontStyle:"italic"}}>Note: Every 3rd checkout will fail.</span>
        {error && <p style={{color:"red"}}>{error}</p>}
      </form>
    </div>
  );
}

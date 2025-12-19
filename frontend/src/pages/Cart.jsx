
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../UserProvider";
import useCartApi from "../api/cartApi";
import useCatalogApi from "../api/catalogApi";

import ProductCard from "../components/ProductCard";

export default function Cart()
{
  const { getProducts } = useCatalogApi();
  const { getCartByUserId, changeCartQty, removeCartItem } = useCartApi();

  const { user } = useAuth();  

  if (user !== null && user.access_id !== 1) { return (<p>No Permission</p>); }

  const [cart, setCart] = useState({}); 
  const [productData, setProductData] = useState([]);
  const [linkOp, setLinkOp] = useState({});
  const [error, setError] = useState("");
  const [sum, setSum] = useState(0);

  useEffect(() => {
    (async () => {
      const c = await getCartByUserId();
      if (Object.keys(c).length === 0) { return; }
      setCart(c);
      const p = await getProducts({ id: Object.keys(c) });
      setProductData(p);
    })();
  }, []);

  useEffect(() => {
    let exceed = false;
    for (const P of productData) { if (P.stock < cart[P.id]) { exceed = true; } }
    if (exceed) { setLinkOp({to: ""}); setError("Cart quantity exceeds product stock"); }
    else { setLinkOp(user ? {to: "/checkout" } : {to: "/login", state:{ returnUrl: "/cart", reason: "Login for Checkout" } }); setError(""); }
  }, [cart, productData]);

  const handleCartEdit = (product_id, qty = 1) => {
    let newCart = {...cart};
    if (qty > 0) { newCart[product_id] = qty; changeCartQty(product_id, qty); }
    else 
    {
      delete newCart[product_id]; 
      removeCartItem(product_id);
      setProductData(productData.filter((a) => a.id !== product_id));
    }
    setCart(newCart);
  };

  useEffect(() => {
    let s = 0;
    for (const P of productData) { s += cart[P.id] * P.price; }
    setSum(s);
  }, [cart, productData]);

  return (
    <div className="search-page">
      <h2>Your Cart</h2>
      {productData.length === 0 && <p>No cart items found.</p>}
      <div>
        {productData.map((a) => (
          <ProductCard
            key={a.id}
            product={a}
            initQty={cart[a.id]}
            cart={cart[a.id]}
            remove={true}
            label={"Edit Qty"}
            action={({product_id, qty}) => handleCartEdit(product_id, qty)}
          />
        ))}
      </div>
      {error && <p style={{color:"red"}}>{error}</p>}
      {(productData.length !== 0 && error === "") && (
        <div style={{display:"flex", flexDirection:"row", justifyContent:"space-between", alignItems:"center"}}>
          <span style={{fontSize:"18px"}}>Total: ${sum.toFixed(2)}</span>
          <Link className="btn" {...linkOp}>Checkout</Link>
        </div>
      )}
    </div>
  );
}
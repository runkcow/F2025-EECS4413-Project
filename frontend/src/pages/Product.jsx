
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../UserProvider";
import useCatalogApi from "../api/catalogApi"
import useCartApi from "../api/cartApi"

export default function Product({})
{
  const { getProductById, changeProductStock } = useCatalogApi();
  const { getCartByUserId, addCartItem, changeCartQty, removeCartItem } = useCartApi();

  const { user } = useAuth();
  const admin = (user !== null && user.access_id === 2);

  const { id } = useParams();
  const product_id = parseInt(id);

  const [error, setError] = useState("");
  const [product, setProduct] = useState({});
  const [cart, setCart] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [qty, setQty] = useState(1);

  // init product
  useEffect(() => {
    (async () => {
      const p = await getProductById(product_id);
      setProduct(p);
      if (admin) { setQty(p.stock); }
      else 
      {
        const c = await getCartByUserId(user.id);
        setCartTotal(Object.keys(c).length);
        if (c[p.id] !== undefined) 
        { 
          setCart(c[p.id]); 
          setQty(Math.max(1, c[p.id]));
        }
      }
    })();
  }, []);

  const handleChangeQty = async (newQty) => {
    const q = parseInt(newQty);
    if (isNaN(q)) { return; }
    if (admin && product.stock !== q) { changeProductStock(product.id, q); setProduct({...product, stock: q}); }
    else
    {
      if (cart === q || q < 0) {}
      else if (cart === 0) { if (cartTotal < 20) { setCart(q); addCartItem(product_id, q); } else { setError("Cart Limit Reached (20)"); } }
      else if (q === 0) { setCart(0); removeCartItem(product_id); }
      else { setCart(q); changeCartQty(product_id, q); }
    }
  }

  return (
    <div style={{display:"flex"}}>
      <img
        style={{width:"500px", height:"500px", objectFit:"cover"}}
        src={product.url}
        alt={product.name}
      />
      <div style={{textAlign:"left"}}>
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <hr/>
        <div style={{display:"flex", alignItems:"center"}}>
          <div style={{display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", margin:"8px"}}>
            <span style={{fontSize:"24px"}}>${product.price}</span>
            {cart !== 0 ? (
              <span>{cart}/{product.stock} of stock in cart</span>
            ) : (
              <span>{product.stock} in stock</span>
            )}
          </div>
          <div>
            <label style={{display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center"}}>
              <span>Stock:</span>
              <input 
                style={{textAlign:"center", width:"130px"}} 
                type="number"
                value={qty}
                min={0}
                onChange={(e) => setQty(e.target.value)} 
              />
            </label>
            {cart !== 0 ? (
              <>
                <button className="btn" style={{borderRadius:"8px 0 0 8px"}} onClick={() => handleChangeQty(qty)}>Edit</button>
                <button className="btn" style={{borderRadius:"0 8px 8px 0", color:"red"}} onClick={() => handleChangeQty(0)}>Remove</button>
              </>
            ) : (
              <button className="btn" onClick={() => handleChangeQty(qty)}>{admin ? "Change Stock" : "Add to Cart"}</button>
            )}
          </div>
        </div>
        {error && <p style={{color:"red"}}>{error}</p>}
      </div>
    </div>
  )
}
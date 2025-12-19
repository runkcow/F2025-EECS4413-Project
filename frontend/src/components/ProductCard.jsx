
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ProductCard({product, cart, remove, stock, initQty, label, action})
{
  const [qty, setQty] = useState(initQty || 1);

  const navigate = useNavigate();

  const handleOnClick = () => {
    let n = parseInt(qty);
    if (isNaN(n)) { n = 1; }
    action({product_id: product.id, qty: n});
  }
  
  // this might not be the best form of modularity
  const handleRemove = () => {
    action({product_id: product.id, qty: 0});
  }

  return (
    <div className="product-card">
      <img 
        className="product-image"
        src={product.url} 
        alt={product.name}
        onClick={() => navigate(`/product/${product.id}`)}
      />
      <div className="product-info">
        <div className="product-text">
          <h3><Link to={`/product/${product.id}`}>{product.name}</Link></h3>
          <p style={{margin:0, flex:1}}>{product.description}</p>
        </div>
        <div className="product-payment">
          <span style={{fontSize: "24px"}}>${product.price}</span>
          {!stock && (cart !== undefined ? (<span>{cart}/{product.stock} of stock in cart</span>) : (<span>{product.stock} in stock</span>))}
          <div style={{display:"flex", justifyContent:"space-around", alignItems:"center"}}>
            {stock ? "Stock:" : "Quantity:"}
            <input 
              style={{width:"40px"}} 
              type="number" 
              value={qty}
              min={0}
              onChange={(e) => setQty(e.target.value)} 
              />
          </div>
          {remove ? (
            <div style={{display:"flex"}}>
              <button className="btn" style={{borderRadius:"8px 0 0 8px"}} onClick={handleOnClick}>{label}</button>            
              <button className="btn" style={{borderRadius:"0 8px 8px 0", color:"red"}} onClick={handleRemove}>Remove</button>
            </div>
          ) : (
            <button className="btn" onClick={handleOnClick}>{label}</button>
          )}
        </div>
      </div>
    </div>
  )
}

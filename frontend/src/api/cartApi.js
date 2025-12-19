
import { useAuth } from "../UserProvider";
import { API_URL, HEADERS_JSON } from "./util";
import { apiFetch } from "./apiFetch";

/**
 * Get cart of user
 * 
 * @param {string} token
 * @param {Object} options
 * @param {number} [options.page]
 * @param {number} [options.pagesize]
 * @returns {Object[]}
 */
export async function getCartByUserId (token)
{
    if (!token)
    {
        return JSON.parse(localStorage.getItem("cart")) || {};
    }
    else
    {
        const res = await apiFetch(token, `${API_URL}/cart`, { headers: HEADERS_JSON(token) });
        if (!res.ok) { throw new Error(`getCartByUserId API failed: ${res.status}`); }
        let data = await res.json();
        return Object.fromEntries(data.map((c) => [c.id, c.qty]));
    }
}

/**
 * Checks whether a user's cart is valid
 * 
 * @param {string} token
 * @returns {boolean} 
 */
export async function validateCart (token)
{
    if (!token) { throw new Error("validateCart called when user is not logged in"); }
    const res = await apiFetch(token, `${API_URL}/cart/validate`,{
        method: 'POST',
        headers: HEADERS_JSON(token)
    });
    if (!res.ok) { throw new Error(`validateCart API failed: ${res.status}`); }
    const data = await res.json();
    return data.valid;
}

/**
 * Adds an item to the cart db 
 * 
 * @param {string} token
 * @param {number} product_id 
 * @param {number} qty
 */
export async function addCartItem (token, product_id, qty)
{
    if (!token)
    {
        let cart = JSON.parse(localStorage.getItem("cart")) || {};
        if (cart[product_id] !== undefined) { cart[product_id] += qty; }
        else if (Object.keys(cart).length < 20) { cart[product_id] = qty; }
        else { throw new Error("CART_LIMIT_REACHED"); }
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    else
    {
        const res = await apiFetch(token, `${API_URL}/cart`, {
            method: 'POST',
            headers: HEADERS_JSON(token),
            body: JSON.stringify({ 
                product_id: product_id,
                qty: qty 
            })
        });
        if (!res.ok) { throw new Error(`addCartItem API failed: ${res.status}`); }
    }
}

/**
 * Changes qty of a cart item
 * 
 * @param {string} token
 * @param {number} product_id 
 * @param {number} qty
 */
export async function changeCartQty (token, product_id, qty)
{
    if (!token)
    {
        let cart = JSON.parse(localStorage.getItem("cart"));
        if (cart[product_id] !== undefined)
        {
            cart[product_id] = qty;
            localStorage.setItem("cart", JSON.stringify(cart));
        }
        else { throw new Error(`changeCartQty could not find cart item`); }
    }
    else
    {
        const res = await apiFetch(token, `${API_URL}/cart`, {
            method: `PATCH`,
            headers: HEADERS_JSON(token),
            body: JSON.stringify({
                product_id: product_id,
                qty: qty
            })
        });
        if (!res.ok) { throw new Error(`changeCartQty API failed: ${res.status}`); }
    }
}

/**
 * Removes cart item
 * 
 * @param {string} token
 * @param {number} product_id 
 */
export async function removeCartItem (token, product_id)
{
    if (!token)
    {
        let cart = JSON.parse(localStorage.getItem("cart"));
        if (cart[product_id] !== undefined)
        {
            delete cart[product_id];
            localStorage.setItem("cart", JSON.stringify(cart));
        }
        else { throw new Error(`changeCartQty could not find cart item`); }
    }
    else
    {
        const res = await apiFetch(token, `${API_URL}/cart/${product_id}`, {
            headers: HEADERS_JSON(token),
            method: `DELETE`
        });
        if (!res.ok) { throw new Error(`removeCartItem API failed: ${res.status}`); }
    }
}

/**
 * Merges a cart with a user
 * 
 * @param {string} token
 */
export async function mergeCart (token)
{
    let cart = JSON.parse(localStorage.getItem("cart")) || {};
    let userCart = await getCartByUserId(token);
    for (const C in cart)
    {
        if (userCart[C] !== undefined) { await changeCartQty(token, C, cart[C] + userCart[C]); }
        else { await addCartItem(token, C, cart[C]); }
    }
    localStorage.removeItem("cart");
}

export default function useCartApi()
{
    const { user } = useAuth();
    const token = user?.token;
    
    return { 
        getCartByUserId: () => getCartByUserId(token), 
        validateCart: () => validateCart(token), 
        addCartItem: (pid, qty) => addCartItem(token, pid, qty), 
        changeCartQty: (pid, qty) => changeCartQty(token, pid, qty), 
        removeCartItem: (pid) => removeCartItem(token, pid), 
        mergeCart: () => mergeCart(token) 
    };   
}
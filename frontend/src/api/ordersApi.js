
import { useAuth } from "../UserProvider";
import { API_URL, HEADERS_JSON } from "./util";
import { apiFetch } from "./apiFetch";

/**
 * Get order by id
 * 
 * @param {string} token
 * @param {number} id 
 * @returns {Object[]}
 */
async function getOrderById (token, id)
{
    const res = await apiFetch(token, `${API_URL}/order/${id}`, { headers: HEADERS_JSON(token) });
    if (!res.ok) { throw new Error(`getOrderById API failed: ${res.status}`); }
    return await res.json();
}

/**
 * Queries for products with optional params
 * 
 * @param {string} token
 * @param {Object} options 
 * @param {string} [options.keyword]
 * @param {string} [options.id]
 * @param {number} [options.username]
 * @param {number} [options.product_name]
 * @param {number} [options.brand_id]
 * @param {number} [options.category_id]
 * @param {string} [options.start_time]
 * @param {string} [options.end_time]
 * @param {number} [options.page]
 * @param {number} [options.pagesize]
 * @returns {Object[]}
 */
async function getOrders (token, options)
{
    let url = `${API_URL}/orders`;
    let init = false;
    for (const O in options)
    {
        url += (init) ? "&" : "?";
        init = true;
        url += `${O}=${encodeURIComponent(options[O])}`;
    }
    const res = await apiFetch(token, url, { headers: HEADERS_JSON(token) });
    if (!res.ok) { throw new Error(`getOrders API failed: ${res.status}`); }
    const data = await res.json();
    return data;
}

/**
 * Gets total through query
 * 
 * @param {string} token
 * @param {Object} options 
 * @param {string} [options.keyword]
 * @param {string} [options.id]
 * @param {number} [options.username]
 * @param {number} [options.product_name]
 * @param {number} [options.brand_id]
 * @param {number} [options.category_id]
 * @param {string} [options.start_time]
 * @param {string} [options.end_time]
 * @returns {number} 
 */
async function getOrdersTotal (token, options)
{
    let url = `${API_URL}/orders/total`;
    let init = false;
    for (const O in options)
    {
        url += (init) ? "&" : "?";
        init = true;
        url += `${O}=${encodeURIComponent(options[O])}`;
    }
    const res = await apiFetch(token, url, { headers: HEADERS_JSON(token) });
    if (!res.ok) { throw new Error(`getOrders API failed: ${res.status}`); }
    return (await res.json()).total;
}

/**
 * Adds a new order
 * 
 * @param {string} token
 * @param {Object} order
 * @param {number} order.qty
 * @param {string} order.datetime
 * @param {number} order.user_id
 * @param {number} order.product_id
 * @param {number} order.address_id
 * @param {number} order.payment_id
 * @returns {number}
 */
// async function addOrder (token, order)
// {
//     order.id = 0; // id is optional when adding
//     const res = await apiFetch(token, `${API_URL}/order`, {
//         method: 'POST',
//         headers: HEADERS_JSON(token),
//         body: JSON.stringify(order)
//     });
//     if (!res.ok) { throw new Error(`addOrder API failed: ${res.status}`); }
//     const data = await res.json();
//     return data.orderId;
// }

/**
 * Performs checkout for a user
 *  
 * @param {string} token
 * @param {Object} address 
 * @param {Object} payment 
 * @returns {number}
 */
async function checkout (token, address, payment)
{
    const res = await apiFetch(token, `${API_URL}/checkout`, {
        method: 'POST',
        headers: HEADERS_JSON(token),
        body: JSON.stringify({ address: address, payment: payment })
    });
    return await res.json();
}

export default function useOrdersApi()
{
    const { user } = useAuth();
    const token = user?.token;

    return { 
        getOrderById: (oid) => getOrderById(token, oid), 
        getOrders: (options) => getOrders(token, options), 
        getOrdersTotal: (options) => getOrdersTotal(token, options), 
        addOrder: (order) => addOrder(token, order), 
        checkout: (address, payment) => checkout(token, address, payment) 
    };
}

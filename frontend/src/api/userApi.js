
import { useAuth } from "../UserProvider";
import { API_URL, HEADERS_JSON } from "./util";
import { apiFetch } from "./apiFetch";

/**
 * Get user by id
 * 
 * @param {string} token
 * @param {number} id
 * @returns {Object} 
 */
async function getUserById (token, id)
{
    const res = await apiFetch(token, `${API_URL}/user/${id}`, { headers: HEADERS_JSON(token) });
    if (!res.ok) { throw new Error(`getUserById API failed: ${res.status}`); }
    return res.json();
}

/**
 * Tries logging a user with credentials 
 * 
 * @param {string} token
 * @param {string} username 
 * @param {string} password 
 * @returns {string}
 */
async function getUserLogin (token, username, password)
{
    const res = await fetch(`${API_URL}/login`, {
        method: `POST`,
        headers: HEADERS_JSON(token),
        body: JSON.stringify({
            username: username,
            password: password
        })
    });
    return await res.json();
}

/**
 * Queries for users
 * 
 * @param {string} token
 * @param {Object} options
 * @param {string} [options.keyword]
 * @param {string} [options.sortname]
 * @param {boolean} [options.sortdirection]
 * @param {number} [options.page]
 * @param {number} [options.pagesize]
 * @returns {Object[]}
 */
async function getUsers (token, options)
{
    let url = `${API_URL}/users`;
    let init = false;
    for (const O in options)
    {
        url += (init) ? "&" : "?";
        init = true;
        url += `${O}=${encodeURIComponent(options[O])}`;
    }
    const res = await apiFetch(token, url, { headers: HEADERS_JSON(token) });
    if (!res.ok) { throw new Error(`getAllUsers API failed: ${res.status}`); }
    return await res.json();
}

/**
 * Gets user total by query
 * 
 * @param {string} token
 * @param {Object} options 
 * @param {string} [options.keyword]
 * @param {string} [options.sortname]
 * @param {boolean} [options.sortdirection]
 * @returns {number}
 */
async function getUsersTotal (token, options)
{
    let url = `${API_URL}/users/total`;
    let init = false;
    for (const O in options)
    {
        url += (init) ? "&" : "?";
        init = true;
        url += `${O}=${encodeURIComponent(options[O])}`;
    }
    const res = await apiFetch(token, url, { headers: HEADERS_JSON(token) });
    if (!res.ok) { throw new Error(`getAllUsers API failed: ${res.status}`); }
    return (await res.json()).total;
}

/**
 * Adds a user
 * 
 * @param {string} token
 * @param {Object} user
 * @param {string} user.username
 * @param {string} user.password
 * @param {string} user.first_name
 * @param {string} user.last_name
 * @param {string} user.phone_number
 * @param {string} user.email
 * @param {number} user.access_id
 * @returns {number}
 */
async function addUser (token, user)
{
    user.id = 0; // id is optional when adding
    const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: HEADERS_JSON(token),
        body: JSON.stringify(user)
    });
    if (!res.ok) { throw new Error(`addUser API failed: ${res.status}`); }
    const data = await res.json();
    return data.userId;
}

/**
 * Changes user information
 * 
 * @param {string} token
 * @param {number} id 
 * @param {Object} changes
 * @param {number} [changes.id]
 * @param {string} [changes.username]
 * @param {string} [changes.password]
 * @param {string} [changes.first_name]
 * @param {string} [changes.last_name]
 * @param {string} [changes.phone_number]
 * @param {string} [changes.email]
 * @param {number} [changes.access_id]
 */
async function updateUser (token, id, changes)
{
    const res = await apiFetch(token, `${API_URL}/users/${id}`, {
        method: 'PATCH',
        headers: HEADERS_JSON(token),
        body: JSON.stringify(changes)
    });
    if (!res.ok) { throw new Error(`updateUser API failed: ${res.status}`); }
}

/**
 * Deletes a user
 * 
 * @param {string} token
 * @param {number} id 
 */
async function softDeleteUser (token, id)
{
    const res = await apiFetch(token, `${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: HEADERS_JSON(token)
    });
    if (!res.ok) { throw new Error(`deleteUser API failed: ${res.status}`); }
}

/**
 * Get address by id
 * 
 * @param {string} token
 * @param {number} id
 * @returns {Object} 
 */
async function getAddressById (token, id)
{
    const res = await apiFetch(token, `${API_URL}/address/${id}`, { headers: HEADERS_JSON(token) });
    if (!res.ok) { throw new Error(`getAddressById API failed: ${res.status}`); }
    return res.json();
}

/**
 * Get address by user id
 * 
 * @param {string} token
 * @param {number} id
 * @returns {Object[]} 
 */
async function getAddressByUserId (token, id)
{
    const res = await apiFetch(token, `${API_URL}/addresses/${id}`, { headers: HEADERS_JSON(token) });
    if (!res.ok) { throw new Error(`getAddressByUserId API failed: ${res.status}`); }
    return res.json();
}

/**
 * Adds an address
 * 
 * @param {string} token
 * @param {Object} address
 * @param {string} address.street
 * @param {string} address.city
 * @param {string} address.province
 * @param {string} address.country
 * @param {string} address.zip_code
 * @returns {number}
 */
async function addAddress (token, address)
{
    address.id = 0; // id is optional when adding
    const res = await apiFetch(token, `${API_URL}/address`, {
        method: 'POST',
        headers: HEADERS_JSON(token),
        body: JSON.stringify(address)
    });
    if (!res.ok) { throw new Error(`addAddress API failed: ${res.status}`); }
    const data = await res.json();
    return data.addressId;
}

/**
 * Changes address information
 * 
 * @param {string} token
 * @param {number} id 
 * @param {Object} changes
 * @param {number} [changes.id]
 * @param {string} [changes.street]
 * @param {string} [changes.city]
 * @param {string} [changes.province]
 * @param {string} [changes.country]
 * @param {string} [changes.zip_code]
 */
async function updateAddress (token, id, changes)
{
    const res = await apiFetch(token, `${API_URL}/address/${id}`, {
        method: 'PATCH',
        headers: HEADERS_JSON(token),
        body: JSON.stringify(changes)
    });
    if (!res.ok) { throw new Error(`updateAddress API failed: ${res.status}`); }
}

/**
 * Deletes an address
 * 
 * @param {string} token
 * @param {number} id 
 */
async function deleteAddress (token, id)
{
    const res = await apiFetch(token, `${API_URL}/address/${id}`, {
        method: 'DELETE',
        headers: HEADERS_JSON(token)
    });
    if (!res.ok) { throw new Error(`deleteAddress API failed: ${res.status}`); }
}

/**
 * Get payment by user id
 * 
 * @param {string} token
 * @param {number} id
 * @returns {Object} 
 */
async function getPaymentById (token, id)
{
    const res = await apiFetch(token, `${API_URL}/payment/${id}`, { headers: HEADERS_JSON(token) });
    if (!res.ok) { throw new Error(`getPaymentById API failed: ${res.status}`); }
    return res.json();
}

/**
 * Get payment by user id
 * 
 * @param {string} token
 * @param {number} id
 * @returns {Object[]} 
 */
async function getPaymentByUserId (token, id)
{
    const res = await apiFetch(token, `${API_URL}/payments/${id}`, { headers: HEADERS_JSON(token) });
    if (!res.ok) { throw new Error(`getPaymentByUserId API failed: ${res.status}`); }
    return res.json();
}

/**
 * Adds an payment
 * 
 * @param {string} token
 * @param {Object} payment
 * @param {string} payment.type
 * @param {string} payment.last4_digits
 * @param {string} payment.expiry_date
 * @param {string} payment.provider
 * @returns {number}
 */
async function addPayment (token, payment)
{
    payment.id = 0; // id is optional when adding
    const res = await apiFetch(token, `${API_URL}/payment`, {
        method: 'POST',
        headers: HEADERS_JSON(token),
        body: JSON.stringify(payment)
    });
    if (!res.ok) { throw new Error(`addPayment API failed: ${res.status}`); }
    const data = await res.json();
    return data.paymentId;
}

/**
 * Changes payment information
 * 
 * @param {string} token
 * @param {number} id 
 * @param {Object} changes
 * @param {number} changes.id
 * @param {string} changes.type
 * @param {string} changes.last4_digits
 * @param {string} changes.expiry_date
 * @param {string} changes.provider
 */
async function updatePayment (token, id, changes)
{
    const res = await apiFetch(token, `${API_URL}/payment/${id}`, {
        method: 'PATCH',
        headers: HEADERS_JSON(token),
        body: JSON.stringify(changes)
    });
    if (!res.ok) { throw new Error(`updatePayment API failed: ${res.status}`); }
}

/**
 * Deletes a payment
 * 
 * @param {string} token
 * @param {number} id 
 */
async function deletePayment (token, id)
{
    const res = await apiFetch(token, `${API_URL}/payment/${id}`, {
        method: 'DELETE',
        headers: HEADERS_JSON(token)
    });
    if (!res.ok) { throw new Error(`deletePayment API failed: ${res.status}`); }
}
   
export default function useUserApi()
{
    const { user } = useAuth();
    const token = user?.token;

    return { 
        getUserById: (uid) => getUserById(token, uid), 
        getUserLogin: (username, password) => getUserLogin(token, username, password), 
        getUsers: (options) => getUsers(token, options), 
        getUsersTotal: (options) => getUsersTotal(token, options), 
        addUser: (user) => addUser(token, user), 
        updateUser: (uid, user) => updateUser(token, uid, user), 
        softDeleteUser: (uid) => softDeleteUser(token, uid), 
        getAddressById: (aid) => getAddressById(token, aid), 
        getAddressByUserId: (uid) => getAddressByUserId(token, uid), 
        addAddress: (address) => addAddress(token, address), 
        updateAddress: (aid, address) => updateAddress(token, aid, address), 
        deleteAddress: (aid) => deleteAddress(token, aid), 
        getPaymentById: (pid) => getPaymentById(token, pid), 
        getPaymentByUserId: (uid) => getPaymentByUserId(token, uid), 
        addPayment: (payment) => addPayment(token, payment), 
        updatePayment: (pid, payment) => updatePayment(token, pid, payment), 
        deletePayment: (pid) => deletePayment(token, pid) 
    };
}

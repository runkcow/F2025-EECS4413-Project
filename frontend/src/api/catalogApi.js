
import { useAuth } from "../UserProvider";
import { API_URL, HEADERS_JSON } from "./util";
import { apiFetch } from "./apiFetch";

/**
 * Get product by id
 * 
 * @param {string} token
 * @param {number} id 
 */
async function getProductById (token, id)
{
    const res = await fetch(`${API_URL}/product/${id}`, { headers: HEADERS_JSON(token) });
    if (!res.ok) { throw new Error(`getProductById API failed: ${res.status}`); }
    return await res.json();
}

/**
 * Queries for products with object of optional params
 * 
 * @param {string} token
 * @param {Object} options
 * @param {number[]} [options.id]
 * @param {number} [options.brand_id]
 * @param {number} [options.category_id]
 * @param {string} [options.keyword]
 * @param {string} [options.sortname]
 * @param {boolean} [options.sortdirection]
 * @param {number} [options.page]
 * @param {number} [options.pagesize]
 * @returns {Object[]} 
 */
async function getProducts (token, options)
{
    let url = `${API_URL}/products`;
    let init = false;
    for (const O in options)
    {
        url += (init) ? "&" : "?";
        init = true;
        if (Array.isArray(options[O]))
        {
            url += options[O].map((a) => `${O}=${encodeURIComponent(a)}`).join("&");
        }
        else
        {
            url += `${O}=${encodeURIComponent(options[O])}`;
        }
    }
    const res = await fetch(url, { headers: HEADERS_JSON(token) });
    if (!res.ok) { throw new Error(`getProducts API failed: ${res.status}`); }
    return await res.json();
}

/**
 * Queries for product count 
 * 
 * @param {string} token
 * @param {Object} options
 * @param {number} [options.brand_id]
 * @param {number} [options.category_id]
 * @param {string} [options.keyword]
 * @returns {number}
 */
async function getProductsTotal (token, options)
{
    let url = `${API_URL}/products/total`;
    let init = false;
    for (const O in options)
    {
        url += (init) ? "&" : "?";
        init = true;
        if (Array.isArray(options[O]))
        {
            url += options[O].map((a) => `${O}=${encodeURIComponent(a)}`).join("&");
        }
        else
        {
            url += `${O}=${encodeURIComponent(options[O])}`;
        }
    }
    const res = await fetch(url, { headers: HEADERS_JSON(token) });
    if (!res.ok) { throw new Error(`getProducts API failed: ${res.status}`); }
    return (await res.json()).total;
}

/**
 * Adds a new product
 * 
 * @param {string} token
 * @param {Object} product
 * @param {string} product.name
 * @param {string} product.description
 * @param {number} product.price
 * @param {number} product.stock
 * @param {string} product.url
 * @param {number} product.category_id
 * @param {number} product.brand_id
 * @returns {number}
 */
async function addProduct (token, product)
{
    product.id = 0; // id is optional when adding
    const res = await apiFetch(token, `${API_URL}/products`, {
        method: 'POST',
        headers: HEADERS_JSON(token),
        body: JSON.stringify(product)
    });
    if (!res.ok) { throw new Error(`addProduct API failed: ${res.status}`); }
    const data = await res.json();
    return data.productId;
}

/**
 * Changes a product's stock
 * 
 * @param {string} token
 * @param {number} id 
 * @param {number} stock
 */
async function changeProductStock (token, id, stock)
{
    const res = await apiFetch(token, `${API_URL}/products/${id}/stock`, {
        method: 'PATCH',
        headers: HEADERS_JSON(token),
        body: JSON.stringify({
            stock: stock
        })
    });
    if (!res.ok) { throw new Error(`changeProductStock API failed: ${res.status}`); }
}

/**
 * Removes a product
 * 
 * @param {string} token
 * @param {number} id 
 */
async function removeProduct (token, id)
{
    const res = await apiFetch(token, `${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: HEADERS_JSON(token)
    });
    if (!res.ok) { throw new Error(`removeProduct API failed: ${res.status}`); }
}

/**
 * Get list of brands by category id
 * Id 0 returns every brand
 * 
 * @param {string} token
 * @param {number} id 
 * @returns {Object[]}
 */
async function getBrandByCategoryId (token, id = 0)
{
    const res = await fetch(`${API_URL}/brands/${id}`, { headers: HEADERS_JSON(token) });
    if (!res.ok) { throw new Error(`getBrandByCategoryId API failed: ${res.status}`); }
    return await res.json();
}

/**
 * Add a brand
 * 
 * @param {string} token
 * @param {string} name 
 */
async function addBrand (token, name)
{
    const res = await apiFetch(token, `${API_URL}/brands`, {
        method: 'POST',
        headers: HEADERS_JSON(token),
        body: JSON.stringify({
            name: name
        })
    });
    if (!res.ok) { throw new Error(`addBrand API failed: ${res.status}`); }
}

/**
 * Get all categories
 * 
 * @param {string} token
 * @returns {object[]}
 */
async function getAllCategories (token)
{
    const res = await fetch(`${API_URL}/categories`, { headers: HEADERS_JSON(token) });
    if (!res.ok) { throw new Error(`getAllCategories API failed: ${res.status}`); }
    return await res.json();
}

/**
 * Add a new category
 * 
 * @param {string} token
 * @param {string} name 
 */
async function addCategory (token, name)
{
    const res = await apiFetch(token, `${API_URL}/category`, {
        method: 'POST',
        headers: HEADERS_JSON(token),
        body: JSON.stringify({
            name: name
        })
    });
    if (!res.ok) { throw new Error(`addCategory API failed: ${res.status}`); }
}

export default function useCatalogApi()
{
    const { user } = useAuth();
    const token = user?.token;

    return { 
        getProductById: (pid) => getProductById(token, pid), 
        getProducts: (options) => getProducts(token, options), 
        getProductsTotal: (options) => getProductsTotal(token, options), 
        addProduct: (product) => addProduct(token, product), 
        changeProductStock: (pid, stock) => changeProductStock(token, pid, stock), 
        removeProduct: (pid) => removeProduct(token, pid), 
        getBrandByCategoryId: (bid) => getBrandByCategoryId(token, bid), 
        addBrand: (name) => addBrand(token, name), 
        getAllCategories: () => getAllCategories(token), 
        addCategory: (name) => addCategory(token, name) 
    };
}
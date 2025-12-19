
import db from "./dbconn.js";

/**
 * Get a cart using user id
 * Assuming user cart is small
 *  
 * @param {number} id user_id
 * @param {Object} options
 * @param {number} [options.page]
 * @param {number} [options.pagesize]
 * @returns {Object[]}
 */
export function getUserCart (id, options)
{
    const {
        page = null,
        pagesize = 20
    } = options;
    let params = [id];
    let sql = `SELECT product_id as id, qty as qty FROM carts WHERE user_id = ?`;
    if (page !== null)
    {
        sql += ` LIMIT ? OFFSET ?`;
        params.push(page, pagesize);
    }
    return db.prepare(sql).all(...params);
}

export function getUserCartTotal (id)
{
    let sql = `SELECT COUNT(*) AS total FROM carts WHERE user_id = ?`;
    return db.prepare(sql).get(id).total;
}

/**
 * Check whether all items of a user's cart is in stock
 * 
 * @param {number} id
 * @returns {boolean} 
 */
export function validateUserCart (id)
{
    let sql = `SELECT 1 FROM carts JOIN products ON products.id = carts.product_id WHERE carts.user_id = ? AND carts.qty > products.stock`;
    return (db.prepare(sql).get(id) === undefined);
}

/**
 * Adds a item to a user's cart
 * 
 * @param {number} user_id 
 * @param {number} product_id 
 * @param {number} qty 
 * @param {number}
 */
export function addCartItem (user_id, product_id, qty)
{
    let sql = `INSERT INTO carts (user_id, product_id, qty) 
    VALUES (?, ?, ?)`;
    return (db.prepare(sql).run(user_id, product_id, qty).changes > 0);
}

/**
 * Changes the quantity for an item on the cart
 * 
 * @param {number} user_id 
 * @param {number} product_id 
 * @param {number} qty 
 * @returns {boolean}
 */
export function updateQuantity (user_id, product_id, qty)
{
    let sql = `UPDATE carts SET qty = ? WHERE user_id = ? AND product_id = ?`;
    return (db.prepare(sql).run(qty, user_id, product_id).changes > 0);
}

/**
 * Deletes a specific cart item
 * 
 * @param {number} user_id 
 * @param {number} product_id 
 * @returns {boolean}
 */
export function deleteCartItem (user_id, product_id)
{
    let sql = `DELETE FROM carts WHERE user_id = ? AND product_id = ?`;
    return (db.prepare(sql).run(user_id, product_id).changes > 0);
}

/**
 * Clears a user's cart
 * 
 * @param {number} user_id
 * @returns {boolean} 
 */
export function clearUserCart (user_id)
{
    let sql = `DELETE FROM carts WHERE user_id = ?`;
    return (db.prepare(sql).run(user_id).changes > 0); // assuming the cart isn't empty
}

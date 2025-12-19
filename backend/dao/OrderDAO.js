
import db from "./dbconn.js";
import { getCurrentTimestamp } from "../helper/date.js";
import Order, { schematic } from "../model/Order.js";
import User from "../model/User.js";
import Address from "../model/Address.js";
import Payment from "../model/Payment.js";
import { clearUserCart } from "./CartDAO.js";

/**
 * Get specific order_product by order_id and product_id
 * 
 * @param {number} order_id 
 * @param {number} product_id 
 * @returns 
 */
export function getOrderByIds (order_id, product_id)
{
    let sql = `SELECT * FROM orders AS o JOIN order_products AS op ON o.id = op.order_id WHERE op.order_id = ? AND op.product_id = ?`
    return new Order(db.prepare(sql).get(order_id, product_id));
}

/**
 * Get order batch by id
 * 
 * @param {number} id 
 * @returns {Order[]} 
 */
export function getOrderBatchById (id)
{
    let sql = `SELECT * FROM orders AS o JOIN order_products AS op ON o.id = op.order_id WHERE o.id = ?`;
    return db.prepare(sql).all(id).map((a) => new Order(a));
}

/**
 * Builds sql query using options
 * 
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
 * @param {boolean} total
 * @returns {Object}
 */
function queryBuilder (options, total = false)
{
    const {
        keyword = null,
        id = null,
        username = null, 
        product_name = null, 
        brand_id = null,
        category_id = null,
        start_time = null,
        end_time = null,
        page = 1,
        pagesize = 20
    } = options;
    let sql = `SELECT ${total ? "COUNT(*) AS total" : "*"} FROM orders AS o JOIN order_products AS op ON o.id = op.order_id`;
    let params = [];
    let where = false;
    if (keyword !== null)
    {
        sql += (where) ? " AND " : " WHERE ";
        where = true;
        sql += "(o.username LIKE ? OR op.product_name LIKE ?)";
        params.push(`%${keyword}%`, `%${keyword}%`);
    }
    const conditions = {
        "id" : "o",
        "username" : "o",
        "product_name" : "op",
        "brand_id" : "op",
        "category_id" : "op"
    };
    for (const cond in conditions)
    {
        if (options[cond] !== null && options[cond] !== undefined)
        {
            sql += (where) ? " AND " : " WHERE ";
            where = true;
            sql += `${conditions[cond]}.${cond} = ?`;
            params.push(options[cond]);
            if (schematic[cond].type === "string") { sql += ` COLLATE NOCASE`; }
        }
    }
    if (start_time !== null && end_time !== null)
    {
        sql += (where) ? " AND " : " WHERE ";
        where = true;
        sql += `o.datetime BETWEEN ? AND ?`;
        params.push(start_time, end_time);
    }
    else if (start_time !== null)
    {
        sql += (where) ? " AND " : " WHERE ";
        where = true;
        sql += `o.datetime > ?`;
        params.push(start_time);
    }
    else if (end_time !== null)
    {
        sql += (where) ? " AND " : " WHERE ";
        where = true;
        sql += `o.datetime < ?`;
        params.push(end_time);
    }
    if (!total)
    {
        // default newest order first
        sql += ` ORDER BY o.datetime DESC`;
        sql += ` LIMIT ? OFFSET ?`;
        params.push(pagesize, (page - 1) * pagesize);
    }
    return { sql, params };
}

/**
 * Get orders by various options
 * 
 * @param {Object} options
 * @returns {Order[]}
 */
export function queryOrders (options)
{
    const obj = queryBuilder(options);
    return db.prepare(obj.sql).all(...obj.params).map((a) => new Order(a));
}

/**
 * Gets the total count of orders
 * 
 * @param {Object} options
 * @returns {number}
 */
export function queryOrdersTotal (options)
{
    const obj = queryBuilder(options, true);
    return db.prepare(obj.sql).get(...obj.params).total;
}

/**
 * Performs checkout for a user with specified address and payment
 * 
 * @param {User} user
 * @param {Address} address
 * @param {Payment} payment
 * @returns {number}
 */
export function checkOut (user, address, payment)
{
    const O_COL = ["datetime", "user_id", "username", "shipping_street", "shipping_city", "shipping_province", "shipping_country", "shipping_zip_code", "payment_type", "payment_last4_digits", "payment_expiry_date", "payment_provider"];
    const OP_COL = ["order_id", "product_id", "product_name", "product_price", "product_url", "category_id", "brand_id", "qty"];
    const date = getCurrentTimestamp();
    let tx = db.transaction((user, address, payment) => {
        // getting user cart
        let sql = `SELECT c.qty AS qty, c.product_id AS product_id, p.name AS product_name, p.price AS product_price, p.url AS product_url, p.category_id AS product_category_id, p.brand_id AS product_brand_id ` +
            `FROM carts AS c JOIN products AS p ON p.id = c.product_id WHERE user_id = ?`;
        const productData = db.prepare(sql).all(user.id);
        if (productData.length === 0) { throw new Error("EMPTY_CART"); }
        // checking of product sufficiency with cart qty must be done atomically to prevent errors from asynchronous
        sql = `WITH cart_items AS (SELECT id, qty, stock FROM carts JOIN products ON products.id = carts.product_id AND carts.user_id = ?), ` +
            `test AS (SELECT NOT EXISTS (SELECT 1 FROM cart_items WHERE qty > stock) AS ok) ` +
            `UPDATE products SET stock = cart_items.stock - cart_items.qty FROM cart_items, test WHERE products.id = cart_items.id AND test.ok = 1`;
        if (db.prepare(sql).run(user.id).changes === 0) { throw new Error("INSUFFICIENT_STOCK"); }
        // create order 
        sql = `INSERT INTO orders (${O_COL.join(", ")}) VALUES (${O_COL.map(() => "?").join(", ")})`;
        const order_id = db.prepare(sql).run([date, user.id, user.username, address.street, address.city, address.province, address.country, address.zip_code, payment.type, payment.last4_digits, payment.expiry_date, payment.provider]).lastInsertRowid;
        // create order_products that are related to the order
        let params = [];
        for (const P of productData) { params.push(order_id, P.product_id, P.product_name, P.product_price, P.product_url, P.product_category_id, P.product_brand_id, P.qty); }
        let placeholder = `(${OP_COL.map(() => "?").join(", ")})`;
        sql = `INSERT INTO order_products (${OP_COL.join(", ")}) VALUES ${productData.map(() => placeholder).join(", ")};`;
        db.prepare(sql).run(...params);
        clearUserCart(user.id);
        return order_id;
    });
    return tx(user, address, payment);
}


import db from "./dbconn.js";
import Payment, { schematic } from "../model/Payment.js";

/**
 * Get payment by id
 * 
 * @param {number} id
 * @returns {Payment} 
 */
export function getPaymentById (id)
{
    let sql = `SELECT * FROM payment_methods WHERE id = ?`;
    return new Payment(db.prepare(sql).get(id));
}

/**
 * Get payment by user_id
 * 
 * @param {number} id 
 * @returns {Payment[]}
 */
export function getPaymentByUserId (id)
{
    let sql = `SELECT * FROM payment_methods WHERE user_id = ?`;
    return db.prepare(sql).all(id).map((a) => new Payment(a));
}

/**
 * Get total payment methods for a user
 * 
 * @param {number} id 
 * @returns {number}
 */
export function getPaymentByUserIdTotal (id)
{
    let sql = `SELECT COUNT(*) AS total FROM payment_methods WHERE user_id = ?`;
    return db.prepare(sql).get(id).total;
}

/**
 * Adds a new payment method
 * 
 * @param {Payment} p
 * @returns {boolean}
 */
export function addPayment (p)
{
    let fields = [];
    let params = [];
    for (const K in schematic)
    {
        if (K !== "id")
        {
            fields.push(K);
            params.push(p[K]);
        }
    }
    let sql = `INSERT INTO payment_methods (${fields.join(", ")}) VALUES (${fields.map(() => "?").join(", ")})`
    return db.prepare(sql).run(...params).lastInsertRowid;
}

/**
 * Updates payment method information
 * 
 * @param {number} id 
 * @param {Object} options
 * @param {string} [options.type]
 * @param {string} [options.last4_digits]
 * @param {string} [options.expiry_date]
 * @param {string} [options.provider]
 * @returns {boolean}
 */
export function updatePayment (id, options)
{
    const {
        type = null,
        last4_digits = null,
        expiry_date = null,
        provider = null
    } = options;
    let list = [
        "type",
        "last4_digits",
        "expiry_date",
        "provider"
    ];
    let changes = [];
    let params = [];
    for (const L of list)
    {
        if (options[L] !== null)
        {
            changes.push(`${L} = ?`);
            params.push(options[L]);
        }
    }
    let sql = `UPDATE payment_methods SET ${changes.join(", ")} WHERE id = ?`;
    params.push(id);
    return (db.prepare(sql).run(...params).changes > 0);
}

/**
 * Deletes payment method
 * 
 * @param {number} id 
 * @returns {boolean}
 */
export function deletePayment (id)
{
    let sql = `DELETE FROM payment_methods WHERE id = ?`;
    return (db.prepare(sql).run(id).changes > 0);
}

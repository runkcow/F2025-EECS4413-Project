
import db from "./dbconn.js";
import Address, { schematic } from "../model/Address.js";

/**
 * Get address by id
 * 
 * @param {number} id
 * @returns {Address} 
 */
export function getAddressById (id)
{
    let sql = `SELECT * FROM addresses WHERE id = ?`;
    return new Address(db.prepare(sql).get(id));
}

/**
 * Get address by user_id
 * 
 * @param {number} id 
 * @returns {Address[]}
 */
export function getAddressByUserId (id)
{
    let sql = `SELECT * FROM addresses WHERE user_id = ?`;
    return db.prepare(sql).all(id).map((a) => new Address(a));
}

/**
 * Get total # of addresses a user has
 *  
 * @param {number} id 
 * @returns {number}
 */
export function getAddressByUserIdTotal (id)
{
    let sql = `SELECT COUNT(*) AS total FROM addresses WHERE user_id = ?`;
    return db.prepare(sql).get(id).total;
}

/**
 * Adds a new address
 * 
 * @param {Address} a
 * @returns {number}
 */
export function addAddress (a)
{
    let fields = [];
    let params = [];
    for (const K in schematic)
    {
        if (K !== "id")
        {
            fields.push(K);
            params.push(a[K]);
        }
    }
    let sql = `INSERT INTO addresses (${fields.join(", ")}) VALUES (${fields.map(() => "?").join(", ")})`
    return db.prepare(sql).run(...params).lastInsertRowid;
}

/**
 * Updates address information
 * 
 * @param {number} id 
 * @param {Object} options
 * @param {string} [options.street]
 * @param {string} [options.city]
 * @param {string} [options.province]
 * @param {string} [options.country]
 * @param {string} [options.zip_code]
 * @returns {boolean}
 */
export function updateAddress (id, options)
{
    const {
        street = null,
        city = null,
        province = null,
        country = null,
        zip_code = null
    } = options;
    let list = [
        "street",
        "city",
        "province",
        "country",
        "zip_code"
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
    let sql = `UPDATE addresses SET ${changes.join(", ")} WHERE id = ?`;
    params.push(id);
    return (db.prepare(sql).run(...params).changes > 0);
}

/**
 * Deletes address
 * 
 * @param {number} id 
 * @returns {boolean}
 */
export function deleteAddress (id)
{
    let sql = `DELETE FROM addresses WHERE id = ?`;
    return (db.prepare(sql).run(id).changes > 0);
}

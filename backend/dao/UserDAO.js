
import db from "./dbconn.js";
import User, { schematic } from "../model/User.js";

/**
 * Get user by id
 * 
 * @param {number} id 
 * @returns {User} 
 */
export function getUserById (id)
{
    let sql = `SELECT * FROM users WHERE id = ?`;
    return new User(db.prepare(sql).get(id));
}

/**
 * Get user by username
 * 
 * @param {string} username 
 * @returns {User}
 */
export function getUserByUsername (username)
{
    let sql = `SELECT * FROM users WHERE username = ?`;
    let res = db.prepare(sql).get(username);
    if (!res) { return null; }
    return new User(res);
}

/**
 * Builds query for users
 * 
 * @param {Object} options
 * @param {string} [options.keyword]
 * @param {string} [options.sortname]
 * @param {boolean} [options.sortdirection]
 * @param {number} [options.page]
 * @param {number} [options.pagesize]
 * @param {number} total
 * @returns {Object}  
 */
function queryBuilder (options, total = false)
{
    const {
        keyword = null,
        sortname = null,
        sortdirection = false,
        page = 1,
        pagesize = 20
    } = options;
    let sql = `SELECT ${total ? "COUNT(*) AS total" : "*"} FROM users WHERE access_id = 1`;
    let params = [];
    if (keyword !== null)
    {
        // sql += ` WHERE (username LIKE ? or first_name LIKE ? or last_name LIKE ?)`;
        // params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
        sql += ` AND (username LIKE ?)`;
        params.push(`%${keyword}%`);
    }
    if (!total)
    {
        if (sortname !== null && Object.keys(schematic).includes(sortname))
        {
            sql += ` ORDER BY ${sortname} `;
            sql += sortdirection ? "DESC" : "ASC";
        }
        sql += ` LIMIT ? OFFSET ?`;
        params.push(pagesize, (page - 1) * pagesize);
    }
    return { sql, params };
}

/**
 * Queries for a list of users
 * 
 * @param {Object} options
 * @param {string} [options.keyword]
 * @param {string} [options.sortname]
 * @param {boolean} [options.sortdirection]
 * @param {number} [options.page]
 * @param {number} [options.pagesize]
 * @returns {User[]}
 */
export function queryUsers (options)
{
    const obj = queryBuilder(options);
    return db.prepare(obj.sql).all(...obj.params).map((a) => new User(a));
}

/**
 * Get total count of users from query
 * 
 * @param {Object} options 
 * @param {string} [options.keyword]
 * @returns {number}
 */
export function queryUsersTotal (options)
{
    const obj = queryBuilder(options, true);
    return db.prepare(obj.sql).get(...obj.params).total;
}

/**
 * Creates a new user
 * 
 * @param {User} u
 * @returns {number}
 */
export function addUser (u)
{
    let fields = [];
    let params = [];
    for (const K in schematic)
    {
        if (K !== "id")
        {
            fields.push(K);
            params.push(u[K]);
        }
    }
    let sql = `INSERT INTO users (${fields.join(", ")}) VALUES (${fields.map(() => "?").join(", ")})`
    return db.prepare(sql).run(...params).lastInsertRowid;
}

/**
 * Updates a user's information
 * Assume that this export function will be ran with at least some changes
 * 
 * @param {number} id 
 * @param {Object} options 
 * @param {string} [options.username]
 * @param {string} [options.password]
 * @param {string} [options.first_name]
 * @param {string} [options.last_name]
 * @param {string} [options.phone_number]
 * @param {string} [options.email]
 * @param {string} [options.access_id]
 * @returns {boolean}
 */
export function updateUser (id, options)
{
    const {
        username = null,
        password = null,
        first_name = null,
        last_name = null,
        phone_number = null,
        email = null,
        access_id = null
    } = options;
    let list = [
        "username",
        "password",
        "first_name",
        "last_name",
        "phone_number",
        "email",
        "access_id"
    ];
    let changes = [];
    let params = [];
    for (const L of list)
    {
        if (options[L] !== undefined && options[L] !== null)
        {
            changes.push(`${L} = ?`);
            params.push(options[L]);
        }
    }
    let sql = `UPDATE users SET ${changes.join(", ")} WHERE id = ?`;
    params.push(id);
    return (db.prepare(sql).run(...params).changes > 0);
}

/**
 * Deletes a user's account
 * 
 * @param {number} id 
 * @returns {boolean}
 */
export function deleteUser (id)
{
    let sql = `DELETE FROM users WHERE id = ?`;
    return (db.prepare(sql).run(id).changes > 0);
}

/**
 * Sets all user information to null, deletes all dependent rows
 * 
 * @param {number} id 
 * @returns {boolean}
 */
export function softDeleteUser (id)
{
    const tx = db.transaction((id) => {
        db.prepare(`DELETE FROM addresses WHERE user_id = ?`).run(id);
        db.prepare(`DELETE FROM payment_methods WHERE user_id = ?`).run(id);
        db.prepare(`DELETE FROM carts WHERE user_id = ?`).run(id);
        const result = db.prepare(`UPDATE users SET username = NULL, password = NULL, first_name = NULL, last_name = NULL, phone_number = NULL, email = NULL, access_id = NULL WHERE id = ?`).run(id);
        return (result.changes > 0);
    });
    return tx(id);
}

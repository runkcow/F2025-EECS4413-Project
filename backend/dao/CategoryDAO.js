
import db from "./dbconn.js";

/**
 * Get category by id
 * 
 * @param {number} id 
 * @returns {string}
 */
export function getCategoryById (id)
{
    let sql = `SELECT * FROM categories WHERE id = ?`;
    return db.prepare(sql).get(id).name;
}

/**
 * Get all categories
 * 
 * @returns {object[]}
 */
export function getAllCategories ()
{
    let sql = `SELECT * FROM categories`;
    return db.prepare(sql).all();
}

/**
 * Adds a new category
 * 
 * @param {string} name 
 * @returns {number}
 */
export function addCategory (name)
{
    let sql = `INSERT INTO categories (name) 
    VALUES (?)`;
    return db.prepare(sql).run(name).lastInsertRowid;
}

/**
 * Deletes a category
 * 
 * @param {number} id 
 * @returns {boolean}
 */
export function deleteCategory (id)
{
    let sql = `DELETE FROM categories WHERE id = ?`;
    return (db.prepare(sql).run(id).changes > 0);
}

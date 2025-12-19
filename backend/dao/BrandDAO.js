
import db from "./dbconn.js";

/**
 * Get brand by id
 * 
 * @param {number} id 
 * @returns {string}
 */
export function getBrandById (id)
{
    let sql = `SELECT * FROM brands WHERE id = ?`;
    return db.prepare(sql).get(id).name;
}

/**
 * Get list of brands by category id
 * @param {number} id 
 * @returns {Object[]}
 */
export function getBrandByCategoryId (id = null)
{
    if (id !== null)
    {
        let sql = `SELECT DISTINCT b.id as id, b.name as name 
        FROM brands as b JOIN products as p ON b.id = p.brand_id 
        WHERE p.category_id = ?;`
        return db.prepare(sql).all(id);
    } else { return getAllBrands(); }
}

/**
 * Get all brands
 * 
 * @returns {Object[]}
 */
function getAllBrands ()
{
    let sql = `SELECT * FROM brands`;
    return db.prepare(sql).all();
}

/**
 * Adds a new brand
 * 
 * @param {string} name 
 * @returns {number}
 */
export function addBrand (name)
{
    let sql = `INSERT INTO brands (name) 
    VALUES (?)`;
    return db.prepare(sql).run(name).lastInsertRowid;
}

/**
 * Deletes a brand
 * 
 * @param {number} id 
 * @returns {boolean}
 */
export function deleteBrand (id)
{
    let sql = `DELETE FROM brands WHERE id = ?`;
    return (db.prepare(sql).run(id).changes > 0);
}

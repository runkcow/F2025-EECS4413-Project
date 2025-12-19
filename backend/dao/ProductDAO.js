
import db from "./dbconn.js";
import Product, { schematic } from "../model/Product.js";

/**
 * Gets a specific product by id
 * 
 * @param {number} id 
 * @returns {Product}
 */
export function getProductById (id)
{
    let sql = `
    SELECT 
        p.id as id,
        p.name as name,
        p.description as description,
        p.price as price,
        p.stock as stock,
        p.category_id as category_id,
        p.brand_id as brand_id,
        p.url as url
    FROM products p 
    JOIN brands b ON p.brand_id = b.id 
    JOIN categories c on p.category_id = c.id
    WHERE p.id = ?
    `;
    return new Product(db.prepare(sql).get(id));
}

/**
 * Builds query for products
 * 
 * @param {Object} options checkbox of brands that will be included in the search
 * @param {number[]} [options.id]
 * @param {number} [options.brand_id] Brand ids to exclude
 * @param {number} [options.category_id] Category ids to focus on 
 * @param {string} [options.keyword] Keywords for filter
 * @param {string} [options.sortname] Exact name of column to sort by
 * @param {boolean} [options.sortdirection] Sort direction, true for DESC
 * @param {number} [options.page]
 * @param {number} [options.pagesize]
 * @param {number} total
 * @returns {Object}
 */
function queryBuilder (options, total = false)
{
    const {
        id = [],
        brand_id = null, 
        category_id = null, 
        keyword = null,
        sortname = null,
        sortdirection = false,
        page = 1,
        pagesize = 20
    } = options;
    let sql = `SELECT ${total ? "COUNT(*) AS total" : "*"} FROM products`;
    let params = [];
    let where = false;
    if (id.length > 0)
    {
        sql += (where) ? " AND " : " WHERE ";
        where = true;
        sql += `id IN (${id.map(() => "?").join(", ")})`;
        params.push(...id);
    }
    if (brand_id !== null) 
    {
        sql += (where) ? " AND " : " WHERE ";
        where = true;
        sql += "brand_id = ?";
        params.push(brand_id); 
    }
    if (category_id !== null) 
    {
        sql += (where) ? " AND " : " WHERE ";
        where = true;
        sql += "category_id = ?";
        params.push(category_id); 
    }
    if (keyword !== null)
    {
        sql += (where) ? " AND " : " WHERE ";
        where = true;
        // sql += "(name LIKE ? OR description LIKE ?)";
        sql += "(name LIKE ?)";
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
 * All encompassing database query
 * 
 * @param {Object} options checkbox of brands that will be included in the search
 * @param {number[]} [options.id]
 * @param {number} [options.brand_id] Brand ids to exclude
 * @param {number} [options.category_id] Category ids to focus on 
 * @param {string} [options.keyword] Keywords for filter
 * @param {string} [options.sortname] Exact name of column to sort by
 * @param {boolean} [options.sortdirection] Sort direction, true for DESC
 * @param {number} [options.page]
 * @param {number} [options.pagesize]
 * @returns {Product[]}
 */
export function queryProducts (options)
{
    const obj = queryBuilder(options);   
    return db.prepare(obj.sql).all(...obj.params).map((a) => new Product(a));
}

/**
 * Gets the total count of items
 * 
 * @param {Object} options
 * @param {number[]} [options.id]
 * @param {number} [options.brand_id] Brand ids to exclude
 * @param {number} [options.category_id] Category ids to focus on 
 * @param {string} [options.keyword] Keywords for filter
 * @returns {number}
 */
export function queryProductsTotal (options)
{
    const obj = queryBuilder(options, true);
    return db.prepare(obj.sql).get(...obj.params).total;
}

/**
 * Adds a new product
 * 
 * @param {Product} p 
 * @returns {number}
 */
export function addProduct (p)
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
    let sql = `INSERT INTO products (${fields.join(", ")}) VALUES (${fields.map(() => "?").join(", ")})`
    return db.prepare(sql).run(...params).lastInsertRowid;
}

/**
 * Changes the stock value of a product
 * 
 * @param {number} id
 * @param {number} stock 
 * @returns {boolean}
 */
export function setProductStock (id, stock)
{
    let sql = `UPDATE products SET stock = ? WHERE id = ?`;
    return (db.prepare(sql).run(stock, id).changes > 0);
}

/**
 * Removes a product from listing
 * 
 * @param {number} id
 * @param {boolean}
 */
export function deleteProduct (id)
{
    let sql = `DELETE FROM products WHERE id = ?`
    return (db.prepare(sql).run(id).changes > 0);
}

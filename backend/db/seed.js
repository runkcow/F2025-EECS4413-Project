
import db from "../dao/dbconn.js";

async function seedDummyJSON()
{
    try {
        const res = await fetch("https://dummyjson.com/products");
        const data = await res.json();

        let categories = {};
        let categoryCounter = 1;
        let brands = { "No brand" : 1 };
        let brandCounter = 2;
        let products = [];
        for (const P of data.products)
        {
            if (categories[P.category] == undefined)
            {
                categories[P.category] = categoryCounter;
                categoryCounter++;
            }
            if (P.brand === undefined)
            {
                P.brand = "No brand";
            }
            else if (brands[P.brand] == undefined)
            {
                brands[P.brand] = brandCounter;
                brandCounter++;
            }
            products.push(`('${P.title.replace("'", "''")}', '${P.description.replace("'", "''")}', ${P.price}, ${P.stock}, ${categories[P.category]}, ${brands[P.brand]}, '${P.images[0].replace("'", "''")}')`);
        }

        let cStr = Object.entries(categories).map(([name, id]) => `(${id}, '${name}')`).join(", ");
        let sql = `INSERT INTO categories (id, name) VALUES ${cStr}`;
        // console.log(sql);
        db.prepare(sql).run();
        
        let bStr = Object.entries(brands).map(([name, id]) => `(${id}, '${name}')`).join(", ");
        sql = `INSERT INTO brands (id, name) VALUES ${bStr}`;
        // console.log(sql);
        db.prepare(sql).run();
        
        sql = `INSERT INTO products (name, description, price, stock, category_id, brand_id, url) VALUES ${products.join(", ")};`;
        // console.log(sql);
        db.prepare(sql).run();
        
    } catch (err) {
        console.error(err);
    }
}

seedDummyJSON();

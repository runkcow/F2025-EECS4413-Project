
// TODO: use req.body instead

import express from "express";
import * as ProductDAO from "../dao/ProductDAO.js";
import * as BrandDAO from "../dao/BrandDAO.js";
import * as CategoryDAO from "../dao/CategoryDAO.js";
import Product from "../model/Product.js";
import { authenticate } from "./authenticate.js";

const router = express.Router();

// product by id
router.get("/product/:id", (req, res) => {
	const id = parseInt(req.params.id);
	if (isNaN(id)) { return res.status(400).json({ error: "Invalid product ID" }); }
	try {
		const data = ProductDAO.getProductById(id);
		if (!data) { return res.status(404).json({ error: "Product does not exist" }); }
		res.json(data);
	} catch (err) {
		console.error("Error fetching product by id:", err);
		res.status(500).json({ error: "Internal server error" });
	}
});

// query for a list of products
router.get("/products", (req, res) => {
	const Q = req.query;
	let options = {};
	try {
		if (Q.id !== undefined) 
		{
			let idArr = Array.isArray(Q.id) ? Q.id : [Q.id];
			options.id = idArr.map((a) => parseInt(a));
		}
		if (Q.brand_id !== undefined) { options.brand_id = parseInt(Q.brand_id); }
		// if (Q.brand_ids !== undefined) 
		// {
		// 	let brandArr = Array.isArray(Q.brand_ids) ? Q.brand_ids : [Q.brand_ids];
		// 	options.brand_ids = brandArr.map((a) => parseInt(a)); 
		// }
		if (Q.category_id !== undefined) { options.category_id = parseInt(Q.category_id); }
		if (Q.keyword !== undefined) { options.keyword = Q.keyword; }
		if (Q.sortname !== undefined) { options.sortname = Q.sortname; }
		if (Q.sortdirection !== undefined) { options.sortdirection = Q.sortdirection === "true"; }
		if (Q.page !== undefined) { options.page = parseInt(Q.page); }
		if (Q.pagesize !== undefined) { options.pagesize = parseInt(Q.pagesize); }
	} catch (err) {
		console.error("Query error:", err);
		res.status(500).json({ error: "Query error" });
	}

	try {
		const data = ProductDAO.queryProducts(options);
		if (!data) { return res.status(404).json({ error: "No product found" }); }
		res.json(data);
	} catch (err) {
		console.error("Error fetching products by query:", err);
		res.status(500).json({ error: "Internal server error" });
	}
});

// get product total from query
router.get("/products/total", (req, res) => {
	const Q = req.query;
	let options = {};
	try {
		if (Q.brand_id !== undefined) { options.brand_id = parseInt(Q.brand_id); }
		if (Q.category_id !== undefined) { options.category_id = parseInt(Q.category_id); }
		if (Q.keyword !== undefined) { options.keyword = Q.keyword; }
	} catch (err) {
		console.error("Query error:", err);
		res.status(500).json({ error: "Query error" });
	}

	try {
		const data = ProductDAO.queryProductsTotal(options);
		if (!data) { return res.status(404).json({ error: "No total found" }); }
		res.json({ total: data });
	} catch (err) {
		console.error("Error fetching product total by query:", err);
		res.status(500).json({ error: "Internal server error" });
	}
});

// add a new product
router.post("/products", authenticate, (req, res) => {
	if (req.user.access_id !== 2) { return res.status(403).json({ error: "Forbidden" }); }
	try {
		const product = new Product(req.body);
		product.validate();
		const id = ProductDAO.addProduct(product);
		if (id) { res.status(201).json({ message: "Product successfully added", productId: id }); }
		else { res.status(404).json({ error: "Product failed to be added" }); }
	} catch (err) {
		console.error("Error adding product:", err);
		res.status(400).json({ error: "Internal server error" });
	}
});

// change product stock
router.patch("/products/:id/stock", authenticate, (req, res) => {
	if (req.user.access_id !== 2) { return res.status(403).json({ error: "Forbidden" }); }
	const id = parseInt(req.params.id);
	const { stock } = req.body;
	if (isNaN(id)) { return res.status(400).json({ error: "Invalid product ID" }); }
	if (stock === undefined || typeof stock !== "number") { return res.status(400).json({ error: "Invalid stock value" }); }
	try {
		if (ProductDAO.setProductStock(id, stock)) { res.json({ message: "Stock successfully updated", id, stock }); }
		else { res.status(404).json({ error: "Product not found" }); }
	} catch (err) {
		console.error("Error updating stock:", err);
		res.status(500).json({ error: "Internal server error" });
	}
});

// delete a product
router.delete("/products/:id", authenticate, (req, res) => {
	if (req.user.access_id !== 2) { return res.status(403).json({ error: "Forbidden" }); }
	const id = parseInt(req.params.id);
    if (isNaN(id)) { return res.status(400).json({ error: "Invalid user ID" }); }
	try {
		if (ProductDAO.deleteProduct(id)) { res.sendStatus(204); }
		else { res.status(404).json({ error: "Product not found" }); }
	} catch (err) {
		console.error("Error deleting product:", err);
		res.status(400).json({ error: "Internal server error" });
	}
});

// search brand by category
router.get("/brands/:id", (req, res) => {
	const id = parseInt(req.params.id);
	if (isNaN(id)) { return res.status(400).json({ error: "Invalid category id" }); }
	try {
		let cid = (id === 0) ? null : id;
		const data = BrandDAO.getBrandByCategoryId(cid);
		if (!data) { return res.status(404).json({ error: "Category id does not exist" }); }
		res.json(data);
	} catch (err) {
		console.error("Error fetching brands by category id:", err);
		res.status(400).json({ error: "Internal server error" });
	}
});

// add brand
router.post("/brands", authenticate, (req, res) => {
	if (req.user.access_id !== 2) { return res.status(403).json({ error: "Forbidden" }); }
	const { name } = req.body;
	try {
		if (BrandDAO.addBrand(name)) { res.status(201).json({ message: "Brand successfully added" }); }
		else { res.status(404).json({ error: "Brand failed to be added" }); }
	} catch (err) {
		console.error("Error adding brand:", err);
		res.status(400).json({ error: "Internal server error" });
	}
})

// get all categories
router.get("/categories", (req, res) => {
	try {
		const data = CategoryDAO.getAllCategories();
		if (!data) { res.status(404).json({ error: "Category not found" }); }
		res.json(data);
	} catch (err) {
		console.error("Error fetching categories:", err);
		res.status(400).json({ error: "Internal server error" });
	}
});

// add category
router.post("/category", authenticate, (req, res) => {
	if (req.user.access_id !== 2) { return res.status(403).json({ error: "Forbidden" }); }
	const { name } = req.body;
	try {
		if (CategoryDAO.addCategory(name)) { res.status(201).json({ message: "Category successfully added" }); }
		else { res.status(404).json({ error: "Category failed to be added" }); }
	} catch (err) {
		console.error("Error adding category:", err);
		res.status(400).json({ error: "Internal server error" });
	}
});

export default router;

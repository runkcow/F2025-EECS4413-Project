
// TODO: use req.body instead

import express from "express";
import * as CartDAO from "../dao/CartDAO.js";
import { authenticate } from "./authenticate.js";

const router = express.Router();

// cart by user id
router.get("/cart", authenticate, (req, res) => {
    if (req.user.access_id !== 1) { return res.status(403).json({ error: "Forbidden" }); }
    const Q = req.query;
    let options = {};
    try {
        if (Q.page !== undefined) { options.page = Q.page; }
        if (Q.pagesize !== undefined) { options.pagesize = Q.pagesize; }
        const data = CartDAO.getUserCart(req.user.id, options);
        res.json(data);
    } catch (err) {
        console.error("Error fetching cart by id:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/cart/total", authenticate, (req, res) => {
    if (req.user.access_id !== 1) { return res.status(403).json({ error: "Forbidden" }); }
    try {
        const data = CartDAO.getUserCartTotal(req.user.id);
        res.json({ total: data });
    } catch (err) {
        console.error("Error fetching cart total by id:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// validate user cart
router.post("/cart/validate", authenticate, (req, res) => {
    if (req.user.access_id !== 1) { return res.status(403).json({ error: "Forbidden" }); }
    try {
        const data = CartDAO.validateUserCart(req.user.id);
        res.json({ message: `Cart item validity:${data}`, valid: data });
    } catch (err) {
        console.error("Error checking validity of cart:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// add a new cart item
router.post("/cart", authenticate, (req, res) => {
    if (req.user.access_id !== 1) { return res.status(403).json({ error: "Forbidden" }); }
    const { product_id, qty } = req.body;
    if (product_id === undefined || qty === undefined) { return res.status(400).json({ error: "User id, product id, and quantity are required"}); }
    try {
        if (CartDAO.getUserCartTotal(req.user.id) >= 20) { return res.status(409).json({ error: "CART_LIMIT_REACHED" }); }
        if (CartDAO.addCartItem(req.user.id, product_id, qty)) { res.status(201).json({ message: "Cart item successfully added" }); }
        else { res.status(404).json({ error: "Cart item failed to be added" }); }
    } catch (err) {
        console.error("Error adding cart item:", err);
        res.status(400).json({ error: "Internal server error" });
    }
});

// change cart qty
router.patch("/cart", authenticate, (req, res) => {
    if (req.user.access_id !== 1) { return res.status(403).json({ error: "Forbidden" }); }
    const { product_id, qty } = req.body;
    if (isNaN(product_id)) { return res.status(400).json({ error: "Invalid product ID" }); }
    if (isNaN(qty)) { return res.status(400).json({ error: "Invalid qty"}); }
    try {
        if (CartDAO.updateQuantity(req.user.id, product_id, qty)) { res.json({ message: "Cart item quantity successfully updated" }); }
        else { res.status(404).json({ error: "Cart item not found" }); }
    } catch (err) {
        console.error("Error updating cart item qty:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// remove a cart item
router.delete("/cart/:product_id", authenticate, (req, res) => {
    if (req.user.access_id !== 1) { return res.status(403).json({ error: "Forbidden" }); }
    const product_id = parseInt(req.params.product_id);
    if (isNaN(product_id)) { return res.status(400).json({ error: "Invalid product ID" }); }
    try {
        if (CartDAO.deleteCartItem(req.user.id, product_id)) { res.sendStatus(204); }
        else { res.status(404).json({ error: "Cart item not found" }); }
    } catch (err) {
        console.error("Error deleting cart item:", err);
        res.status(400).json({ error: "Internal server error" });
    }
});

export default router;


// TODO: use req.body instead

import express from "express";
import * as OrderDAO from "../dao/OrderDAO.js";
import Order from "../model/Order.js";
import User from "../model/User.js";
import Address from "../model/Address.js";
import Payment from "../model/Payment.js";
import { getUserById } from "../dao/UserDAO.js";
import { authenticate } from "./authenticate.js";


const router = express.Router();

// order by id
router.get("/order/:id", authenticate, (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { return res.status(400).json({ error: "Invalid order ID" }); }
    try {
        const order = OrderDAO.getOrderBatchById(id);
        if (!order) { return res.status(404).json({ error: "Order does not exist" }); }
        if (req.user.id !== order[0].user_id && req.user.access_id !== 2) { return res.status(403).json({ error: "Forbidden" }); }
        res.json(order);
    } catch (err) {
        console.error("Error fetching Order by id:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// query for a list of order
router.get("/orders", authenticate, (req, res) => {
    const Q = req.query;
    let options = {};
    try {
        if (Q.keyword !== undefined) { options.keyword = Q.keyword; }
        if (Q.id !== undefined) { options.id = Q.id; }
        if (req.user.access_id !== 2) { options.username = req.user.username; }
        else if (Q.username !== undefined) { options.username = Q.username; }
        if (Q.product_name !== undefined) { options.product_name = Q.product_name; }
        if (Q.brand_id !== undefined) { options.brand_id = parseInt(Q.brand_id); }
        if (Q.category_id !== undefined) { options.category_id = parseInt(Q.category_id); }
        if (Q.start_time !== undefined) { options.start_time = Q.start_time; }
        if (Q.end_time !== undefined) { options.end_time = Q.end_time; }
        if (Q.page !== undefined) { options.page = parseInt(Q.page); }
        if (Q.pagesize !== undefined) { options.pagesize = parseInt(Q.pagesize); }
    } catch (err) {
        console.error("Query error:", err);
        res.status(500).json({ error: "Query error" });
    }
    try {
        const data = OrderDAO.queryOrders(options);
        res.json(data);
    } catch (err) {
        console.error("Error fetching order by query:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// query count
router.get("/orders/total", authenticate, (req, res) => {
    const Q = req.query;
    let options = {};
    try {
        if (Q.keyword !== undefined) { options.keyword = Q.keyword; }
        if (req.user.access_id !== 2) { options.username = req.user.username; }
        else if (Q.username !== undefined) { options.username = Q.username; }
        if (Q.product_id !== undefined) { options.product_id = parseInt(Q.product_id); }
        if (Q.product_brand_id !== undefined) { options.product_brand_id = parseInt(Q.product_brand_id); }
        if (Q.product_category_id !== undefined) { options.product_category_id = parseInt(Q.product_category_id); }
        if (Q.start_time !== undefined) { options.start_time = Q.start_time; }
        if (Q.end_time !== undefined) { options.end_time = Q.end_time; }
    } catch (err) {
        console.error("Query error:", err);
        res.status(500).json({ error: "Query error" });
    }
    try {
        const data = OrderDAO.queryOrdersTotal(options);
		res.json({ total: data });
    } catch (err) {
        console.error("Error fetching order total by query:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// simulating credit card authorization failure
let simulateFailure = 0;

// checkout
router.post("/checkout", authenticate, (req, res) => {
    if (++simulateFailure > 2) { simulateFailure = 0; return res.status(400).json({ success: false, error: "CARD_AUTHENTICATION_ERROR" }); }
    if (req.user.access_id !== 1) { return res.status(403).json({ success: false, error: "Forbidden" }); }
    const { address, payment } = req.body;
    try {
        const user = getUserById(req.user.id);
        const u = new User(user);
        u.validate();
        const a = new Address(address);
        a.validate();
        const p = new Payment(payment);
        p.validate();
        const id = OrderDAO.checkOut(u, a, p);
        res.status(201).json({ success: true, message: "Checkout succeeded, Order added", orderId: id });
    } catch (err) {
        console.error("Error cart checkout:", err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

export default router;

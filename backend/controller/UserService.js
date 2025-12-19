
// TODO: use req.body instead

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as UserDAO from "../dao/UserDAO.js";
import * as AddressDAO from "../dao/AddressDAO.js";
import * as PaymentDAO from "../dao/PaymentDAO.js";
import User from "../model/User.js";
import Address from "../model/Address.js";
import Payment from "../model/Payment.js";
import { authenticate } from "./authenticate.js";

const SALT_ROUNDS = 12;

const router = express.Router();

// user by id
router.get("/user/:id", authenticate, (req, res) => {
    const id = parseInt(req.params.id);
    if (req.user.id !== id && req.user.access_id !== 2) { return res.status(403).json({ error: "Forbidden" }); }
    if (isNaN(id)) { return res.status(400).json({ error: "Invalid user ID" }); }
    try {
        const user = UserDAO.getUserById(id);
        if (!user) { return res.status(404).json({ error: "User does not exist" }); }
        res.json(user);
    } catch (err) {
        console.error("Error fetching user by id:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// try user login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (username === undefined || password === undefined) 
    {
        return res.status(400).json({ success: false, error: "Username and password are required" }); 
    }
    try {
        const data = UserDAO.getUserByUsername(username);
        if (!data)
        {
            return res.status(401).json({ success: false, error: "User not found" });
        }
        const match = await bcrypt.compare(password, data.password);
        if (!match)
        {
            return res.status(401).json({ success: false, error: "Incorrect password" });
        }
        const token = jwt.sign(
            { id: data.id, username, access_id: data.access_id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        res.json({ success: true, message: "Login successful", token: token, user: { id: data.id, access_id: data.access_id, username: data.username, first_name: data.first_name, last_name: data.last_name } });
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// query for users
router.get("/users", authenticate, (req, res) => {
    if (req.user.access_id !== 2) { return res.status(403).json({ error: "Forbidden" }); }
    const Q = req.query;
    let options = {};
    try {
        if (Q.keyword !== undefined) { options.keyword = Q.keyword; }
        if (Q.sortname !== undefined) { options.sortname = Q.sortname; }
        if (Q.sortdirection !== undefined) { options.sortdirection = Q.sortdirection === 'true'; }
        if (Q.page !== undefined) { options.page = parseInt(Q.page); }
        if (Q.pagesize !== undefined) { options.pagesize = parseInt(Q.pagesize); }
    } catch (err) {
        console.error("Query error:", err);
        res.status(500).json({ error: "Query error" });
    }

    try {
        const data = UserDAO.queryUsers(options);
        res.json(data);
    } catch (err) {
        console.error("Error fetching users by query:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// query for user count
router.get("/users/total", authenticate, (req, res) => {
    if (req.user.access_id !== 2) { return res.status(403).json({ error: "Forbidden" }); }
    const Q = req.query;
    let options = {};
    try {
        if (Q.keyword !== undefined) { options.keyword = Q.keyword; }
    } catch (err) {
        console.error("Query error:", err);
        res.status(500).json({ error: "Query error" });
    }
    try {
        const data = UserDAO.queryUsersTotal(options);
		res.json({ total: data });
    } catch (err) {
        console.error("Error fetching users total by query:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// add a new user
router.post("/users", async (req, res) => {
    try {
        const user = new User(req.body);
        user.validate();
        const hash = await bcrypt.hash(user.password, SALT_ROUNDS);
        user.password = hash;
        const id = UserDAO.addUser(user) 
        if (id) { res.status(201).json({ message: "User successfully added", userId: id }); }
        else { res.status(404).json({ error: "User failed to be added" }); }
    } catch (err) {
        console.error("Error adding user:", err);
        res.status(400).json({ error: "Internal server error" });
    }
});

// change a users values
router.patch("/users/:id", authenticate, async (req, res) => {
    const id = parseInt(req.params.id);
    if (req.user.id !== id && req.user.access_id !== 2) { return res.status(403).json({ error: "Forbidden" }); }
    if (isNaN(id)) { return res.status(400).json({ error: "Invalid user ID" }); }
    const options = req.body;
    try {
        const user = UserDAO.getUserById(id);
        options.access_id = user.access_id; // access_id is immutable
        if (options.password !== undefined) { options.password = await bcrypt.hash(options.password, SALT_ROUNDS); }        
        if (UserDAO.updateUser(id, options)) { res.json({ message: "User successfully updated" }); }
        else { res.status(404).json({ error: "User not found"}); }
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// delete a user
router.delete("/users/:id", authenticate, (req, res) => {
    const id = parseInt(req.params.id);
    if (req.user.id !== id && req.user.access_id !== 2) { return res.status(403).json({ error: "Forbidden" }); }
    if (isNaN(id)) { return res.status(400).json({ error: "Invalid user ID" }); }
    try {
        if (UserDAO.softDeleteUser(id)) { res.sendStatus(204); }
        else { res.status(404).json({ error: "User not found" }); }
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(400).json({ error: "Internal server error" });
    }
});

// get address by id
router.get("/address/:id", authenticate, (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { return res.status(400).json({ error: "Invalid address ID" }); }
    try {
        const address = AddressDAO.getAddressById(id);
        if (!address) { return res.status(404).json({ error: "Address does not exist" }); }
        if (req.user.id !== address.user_id && req.user.access_id !== 2) { return res.status(403).json({ error: "Forbidden" }); }
        res.json(address);
    } catch (err) {
        console.error("Error fetching address by id:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// get addresses by user id
router.get("/addresses/:id", authenticate, (req, res) => {
    const id = parseInt(req.params.id);
    if (req.user.id !== id && req.user.access_id !== 2) { return res.status(403).json({ error: "Forbidden" }); }
    if (isNaN(id)) { return res.status(400).json({ error: "Invalid user ID" }); }
    try {
        const address = AddressDAO.getAddressByUserId(id);
        res.json(address);
    } catch (err) {
        console.error("Error fetching addresses by user id:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// add a new addresss
router.post("/address", authenticate, async (req, res) => {
    if (req.user.id !== req.body.user_id && req.user.access_id !== 2) { return res.status(403).json({ error: "Forbidden" }); }
    try {
        if (AddressDAO.getAddressByUserIdTotal(req.body.user_id) >= 5) { return res.status(409).json({ error: "ADDRESS_LIMIT_REACHED" }); }
        const user = UserDAO.getUserById(req.body.user_id);
        if (user.access_id !== 1) { return res.status(403).json({ error: "Forbidden" }); }
        const address = new Address(req.body);
        address.validate();
        const id = AddressDAO.addAddress(address);
        if (id) { res.status(201).json({ message: "Address successfully added", addressId: id }); }
        else { res.status(404).json({ error: "Address failed to be added" }); }
    } catch (err) {
        console.error("Error adding address:", err);
        res.status(400).json({ error: "Internal server error" });
    }
});

// change address values
router.patch("/address/:id", authenticate, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { return res.status(400).json({ error: "Invalid address ID" }); }
    const options = req.body;
    try {
        const address = AddressDAO.getAddressById(id);
        if (!address) { res.status(404).json({ error: "Address not found" })}
        if (req.user.id !== address.user_id && req.user.access_id !== 2) { return res.status(403).json({ error: "Forbidden" }); }
        AddressDAO.updateAddress(id, options);
        res.json({ message: "Address successfully updated" });
    } catch (err) {
        console.error("Error updating address:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// delete address
router.delete("/address/:id", authenticate, (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { return res.status(400).json({ error: "Invalid address ID" }); }
    try {
        const address = AddressDAO.getAddressById(id);
        if (req.user.id !== address.user_id && req.user.access_id !== 2) { return res.status(403).json({ error: "Forbidden" }); }
        if (AddressDAO.deleteAddress(id)) { res.sendStatus(204); }
        else { res.status(404).json({ error: "Address not found" }); }
    } catch (err) {
        console.error("Error deleting address:", err);
        res.status(400).json({ error: "Internal server error" });
    }
});

// get payment by id
router.get("/payment/:id", authenticate, (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { return res.status(400).json({ error: "Invalid payment ID" }); }
    try {
        const payment = PaymentDAO.getPaymentById(id);
        if (req.user.id !== payment.user_id && req.user.access_id !== 2) { return res.status(403).json({ error: "Forbidden" }); }
        if (!payment) { return res.status(404).json({ error: "Payment does not exist" }); }
        res.json(payment);
    } catch (err) {
        console.error("Error fetching payment by id:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// get payments by user id
router.get("/payments/:id", authenticate, (req, res) => {
    const id = parseInt(req.params.id);
    if (req.user.id !== id && req.user.access_id !== 2) { return res.status(403).json({ error: "Forbidden" }); }
    if (isNaN(id)) { return res.status(400).json({ error: "Invalid user ID" }); }
    try {
        const payment = PaymentDAO.getPaymentByUserId(id);
        res.json(payment);
    } catch (err) {
        console.error("Error fetching payment by user id:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// add a new payment
router.post("/payment", authenticate, async (req, res) => {
    if (req.user.id !== req.body.user_id && req.user.access_id !== 2) { return res.status(403).json({ error: "Forbidden" }); }
    try {
        if (PaymentDAO.getPaymentByUserIdTotal(req.body.user_id) >= 5) { return res.status(409).json({ error: "PAYMENT_LIMIT_REACHED" }); }
        const user = UserDAO.getUserById(req.body.user_id);
        if (user.access_id !== 1) { return res.status(403).json({ error: "Forbidden" }); }
        const payment = new Payment(req.body);
        payment.validate();
        const id = PaymentDAO.addPayment(payment);
        if (id) { res.status(201).json({ message: "Payment successfully added", paymentId: id }); }
        else { res.status(404).json({ error: "Payment failed to be added" }); }
    } catch (err) {
        console.error("Error adding payment:", err);
        res.status(400).json({ error: "Internal server error" });
    }
});

// change payment values
router.patch("/payment/:id", authenticate, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { return res.status(400).json({ error: "Invalid payment ID" }); }
    const options = req.body;
    try {
        const payment = PaymentDAO.getPaymentById(id);
        if (!payment) { res.status(404).json({ error: "Payment not found" }); }
        if (req.user.id !== payment.user_id && req.user.access_id !== 2) { return res.status(403).json({ error: "Forbidden" }); }
        PaymentDAO.updatePayment(id, options);
        res.json({ message: "Payment successfully updated" });
    } catch (err) {
        console.error("Error updating payment:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// delete payment
router.delete("/payment/:id", authenticate, (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { return res.status(400).json({ error: "Invalid payment ID" }); }
    try {
        const payment = PaymentDAO.getPaymentById(id);
        if (!payment) { res.status(404).jsson({ error: "Payment not found" }); }
        if (req.user.id !== payment.user_id && req.user.access_id !== 2) { return res.status(403).json({ error: "Forbidden" }); }
        PaymentDAO.deletePayment(id); 
        res.sendStatus(204);
    } catch (err) {
        console.error("Error deleting payment:", err);
        res.status(400).json({ error: "Internal server error" });
    }
});

export default router;

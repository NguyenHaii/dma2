const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const authenticateToken = require("../middleware/auth");

// Public API - ai cũng truy cập được
router.get("/public", (req, res) => {
    res.json({ message: "This is a public API." });
});

// CREATE (protected)
router.post("/products", authenticateToken, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// READ ALL (public)
router.get("/products", async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// READ ONE (public)
router.get("/products/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: "Not found" });
        res.json(product);
    } catch (err) {
        res.status(400).json({ error: "Invalid ID" });
    }
});

// UPDATE (protected)
router.put("/products/:id", authenticateToken, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ error: "Not found" });
        res.json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE (protected)
router.delete("/products/:id", authenticateToken, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ error: "Not found" });
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;

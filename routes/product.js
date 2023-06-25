const express = require('express');
const connection = require('../database/connection');
const router = express.Router();
const auth = require('../services/authentication');
const checkRole = require('../services/checkRole');

// Product add 
router.post('/add', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const product = req.body;
    const query = `
        INSERT INTO product(name, categoryId, description, price, status)
        VALUES(?, ?, ?, ?, 'true)`;
    connection.query(
        query,
        [product.name, product.categoryId, product.description, product.price],
        (err, results) => {
            if (!err)
                return res.status(200).json({ message: "Product added successfully" });
            else
                return res.status(500).json(err);
        }
    );
});

// Product get
router.get('/get', auth.authenticateToken, (req, res) => {
    const query = `
        SELECT p.id, p.name, p.description, p.price, p.status, c.id AS categoryId, c.name AS categoryName 
        FROM product AS p INNER JOIN category AS c
        WHERE p.categoryId = c.id`;
    connection.query(query, (err, results) => {
        if (!err)
            return res.status(200).json(results);
        else
            return res.status(500).json(err);
    });
});

// Get product By category Id
router.get('/getByCategory/:id', auth.authenticateToken, (req, res) => {
    const id = req.params.id;
    const query = `
        SELECT id, name
        FROM product
        WHERE categoryId = ? AND status = 'true'`;
    connection.query(query, [id], (err, results) => {
        if (!err)
            return res.status(200).json(results);
        else
            return res.status(500).json(err);
    });
});

// Get product by product id
router.get('/getBYId/:id', auth.authenticateToken, (req, res) => {
    const id = req.params.id;
    const query = `
        SELECT id, name, description, price 
        FROM product 
        WHERE id = ?`;
    connection.query(query, [id], (err, results) => {
        if (!err)
            return res.status(200).json(results[0]);
        else
            return res.status(500).json(err);
    });
});

// Product Update
router.patch('/update', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const product = req.body;
    const query = `
        UPDATE product 
        SET name = ?, categoryId = ?, description = ?, price = ? 
        WHERE id = ?`;
    connection.query(
        query,
        [product.name, product.categoryId, product.description, product.price, product.id],
        (err, results) => {
            if (!err) {
                if (results.affectedRows === 0)
                    return res.status(404).json({ message: "Product id does not found" });
                return res.status(200).json({ message: "Product updated successfully" });
            }
            else
                return res.status(500).json(err);
        }
    );
});

// Product Delete by product Id
router.delete('/delete/:id', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const id = req.params.id;
    const query = `DELETE FROM product WHERE id = ?`;
    connection.query(query, [id], (err, results) => {
        if (!err) {
            if (results.affectedRows === 0)
                return res.status(404).json({ message: "Product id does not found" });
            return res.status(200).json({ message: "Product deleted successfully" });
        }
        else
            return res.status(500).json(err);
    });
});

// Product status update
router.patch('/updateStatus', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const user = req.body;
    const query = `UPDATE product SET status = ? WHERE id = ?`;
    connection.query(query, [user.status, user.id], (err, results) => {
        if (!err) {
            if (results.affectedRows === 0)
                return res.status(404).json({ message: "Product id does not found" });
            return res.status(200).json({ message: "Product status updated successfully" });
        }
        else
            return res.status(500).json(err);
    });
});

module.exports = router;
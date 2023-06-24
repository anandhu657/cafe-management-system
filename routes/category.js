const express = require('express');
const connection = require('../database/connection');
const router = express.Router();
const auth = require('../services/authentication');
const checkRole = require('../services/checkRole');

// Category add
router.post('/add', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const category = req.body;
    const query = "INSERT INTO category(name) VALUES(?)";
    connection.query(query, [category.name], (err, results) => {
        if (!err)
            return res.status(200).json({ message: "Category added succefully" });
        else
            return res.status(500).json(err);
    })
});

// Category get
router.get('/get', auth.authenticateToken, (req, res) => {
    const query = "SELECT * FROM category ORDER BY name";
    connection.query(query, (err, results) => {
        if (!err)
            return res.status(200).json(results);
        else
            return res.status(500).json(err)
    })
})

// Category update
router.patch('/update', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const product = req.body;
    const query = `
        UPDATE category 
        SET name = ? 
        WHERE id = ?`;
    connection.query(query, [product.name, product.id], (err, results) => {
        if (!err) {
            if (results.affectedRows === 0)
                return res.status(404).json({ message: "Category id does not exist" });
            return res.status(200).status({ message: "Category updated successfully" });
        }
        else
            return res.status(500).json(err)
    })
})

module.exports = router;
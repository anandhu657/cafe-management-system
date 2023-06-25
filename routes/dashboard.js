const express = require('express');
const connection = require('../database/connection');
const router = express.Router();
const auth = require('../services/authentication');

// Dashboard details
router.get('/details', auth.authenticateToken, (req, res) => {
    let categoryCount;
    let productCount;
    let billCount;

    // Query for count category
    const query1 = `SELECT COUNT(id) AS categoryCount FROM category`;
    connection.query(query1, (err, results) => {
        if (!err)
            categoryCount = results[0].categoryCount;
        else
            return res.status(500).json(err);
    });

    // Query for count product
    const query2 = `SELECT COUNT(id) AS productCount FROM product`;
    connection.query(query2, (err, results) => {
        if (!err)
            productCount = results[0].productCount;
        else
            return res.status(500).json(err);
    });

    // Query for count bill
    const query3 = `SELECT COUNT(id) AS billCount FROM bill`;
    connection.query(query3, (err, results) => {
        if (!err)
            billCount = results[0].billCount;
        else
            return res.status(500).json(err);
    });

    // Return all data 
    const data = {
        category: categoryCount,
        product: productCount,
        bill: billCount
    }
    return res.status(200).json(data);
});

module.exports = router;
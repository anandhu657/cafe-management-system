const express = require('express');
const connection = require('../database/connection');
const router = express.Router();
const ejs = require('ejs');
const pdf = require('html-pdf');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
const auth = require('../services/authentication');

// Generate pdf
router.post('/generateReport', auth.authenticateToken, (req, res) => {
    const generateUuid = uuid.v1();
    const orderDetails = req.body;
    const productDetailsReport = JSON.parse(orderDetails.productDetails);
    const query = `
        INSERT INTO bill
        (name, uuid, email, contactNumber, paymentMethod, total, productDetails, createdBy) 
        VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;
    connection.query(
        query,
        [
            orderDetails.name,
            generateUuid,
            orderDetails.email,
            orderDetails.contactNumber,
            orderDetails.paymentMethod,
            orderDetails.totalAmount,
            orderDetails.productDetails,
            res.locals.email
        ],
        (err, results) => {
            if (!err) {
                ejs.renderFile(
                    path.join(__dirname, '', "report.ejs"),
                    {
                        productDetails: productDetailsReport,
                        name: orderDetails.name,
                        email: orderDetails.email,
                        contactNumber: orderDetails.contactNumber,
                        paymentMethod: orderDetails.paymentMethod,
                        totalAmount: orderDetails.totalAmount,
                    },
                    (err, results) => {
                        if (err)
                            return res.status(500).json(err)
                        else {
                            pdf.create(results).toFile('./generatedPDF/' + generateUuid + ".pdf",
                                (err, data) => {
                                    if (err) {
                                        console.log(err);
                                        return res.status(500).json(err);
                                    } else
                                        return res.status(200).json({ uuid: generateUuid });
                                }
                            );
                        }
                    }
                );
            }
            else
                return res.status(500).json(err)
        }
    );
});

// Get pdf
router.post('/getPdf', auth.authenticateToken, (req, res) => {
    const orderDetails = req.body;
    const pdfPath = './generatedPDF' + orderDetails.uuid + '.pdf';
    if (fs.existsSync(pdfPath)) {
        res.contentType("application/pdf");
        fs.createReadStream(pdfPath).pipe(res);
    } else {
        const productDetailsReport = JSON.parse(orderDetails.productDetails);
        ejs.renderFile(
            path.join(__dirname, '', "report.ejs"),
            {
                productDetails: productDetailsReport,
                name: orderDetails.name,
                email: orderDetails.email,
                contactNumber: orderDetails.contactNumber,
                paymentMethod: orderDetails.paymentMethod,
                totalAmount: orderDetails.totalAmount,
            },
            (err, results) => {
                if (err)
                    return res.status(500).json(err)
                else {
                    pdf.create(results).toFile('./generatedPDF/' + orderDetails.uuid + ".pdf",
                        (err, data) => {
                            if (err) {
                                console.log(err);
                                return res.status(500).json(err);
                            } else {
                                res.contentType("application/pdf");
                                fs.createReadStream(pdfPath).pipe(res);
                            }
                        }
                    );
                }
            }
        );
    }
});

// Get all bills
router.get('/getBills', auth.authenticateToken, (req, res) => {
    const query = `SELECT * FROM bill ORDER BY id DESC`;
    connection.query(query, (err, results) => {
        if (!err)
            return res.status(200).json(results);
        else
            return res.status(500).json(err);
    });
});

router.delete('/delete/:id', auth.authenticateToken, (req, res) => {
    const id = req.params.id;
    const query = `DELETE FROM bill WHERE id = ?`;
    connection.query(query, [id], (err, results) => {
        if (!err) {
            if (results.affectedRows === 0)
                return res.status(404).json({ message: "Bill id does not found" });
            return res.status(200).json({ message: "Bill deleted successfully" });
        } else
            return res.status(500).json(err);
    });
});

module.exports = router;
const express = require('express');
const connection = require('../database/connection');
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../services/authentication');
const checkRole = require('../services/checkRole');

// Signup API
router.post('/signup', (req, res) => {
    const user = req.body;
    const query = "SELECT email,password,role,status FROM user WHERE email = ?"
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0) {
                const query = "INSERT INTO user(name,contactNumber,email,password,status,role) values(?,?,?,?,'false','user')";
                connection.query(query, [user.name, user.contactNumber, user.email, user.password], (err, results) => {
                    if (!err)
                        return res.status(200).json({ message: "Successfully Registered" });
                    else
                        return res.status(500).json(err)

                })
            } else
                return res.status(400).json({ message: "Email already exist." })

        } else
            return res.status(500).json(err);
    })
})


// login API
router.post('/login', (req, res) => {
    const user = req.body;
    const query = "SELECT email,password,role,status FROM user WHERE email = ?";
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0 || results[0].password !== user.password)
                return res.status(401).json({ message: "Incorrect username or password" });
            else if (results[0].status === 'false')
                return res.status(401).json({ message: "Wait for admin approval" });
            else if (results[0].password === user.password) {
                const response = {
                    email: results[0].email,
                    role: results[0].role
                }
                const accessToken = jwt.sign(
                    response,
                    process.env.ACCESS_TOKEN,
                    { expiresIn: '8h' }
                );
                res.status(200).json({ token: accessToken });
            } else
                return res.status(400).json({ message: "Something went wrong please try again later" });
        } else
            return res.status(500).json(err);
    })
})

// Get user details
router.get('/get', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const query = "SELECT id,name,email,contactNumber,status FROM user WHERE role = 'user'";
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    })
})

// update user status
router.patch('/update', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const user = req.body;
    const query = "UPDATE user SET status = ? WHERE id = ?";
    connection.query(query, [user.status, user.id], (err, results) => {
        if (!err) {
            if (results.affectedRows === 0)
                return res.status(404).json({ message: "User id does not exist" });
            return res.status(200).json({ message: "User updated successfully" });
        } else
            return res.status(500).json(err);
    })
})

router.get('/checkToken', auth.authenticateToken, (req, res) => {
    res.status(200).json({ message: "true" })
})

router.post('/changePassword', auth.authenticateToken, (req, res) => {
    const user = req.body;
    const email = res.locals.email;
    const query = "SELECT * FROM user WHERE email = ? AND password = ?";
    connection.query(query, [email, user.oldPassword], (err, results) => {
        if (!err) {
            if (results.length <= 0)
                return res.status(400).json({ message: "Incorrect old password" });
            else if (results[0].password === user.oldPassword) {
                const query = "UPDATE user SET password = ? WHERE email = ?";
                connection.query(query, [user.newPassword, email], (err, results) => {
                    if (!err) {
                        return res.status(200).json({ message: "Password update successfully" });
                    }
                    else
                        return res.status(500).json(err)
                })
            }
            else
                return res.status(400).json({ message: "Something went wrong please try again latet" });
        } else
            return res.status(500).json(err);
    })
})

module.exports = router;
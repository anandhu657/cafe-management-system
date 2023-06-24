const connection = require('./database/connection');
const userRoute = require('./routes/user');
const categoryRoute = require('./routes/category');
const productRoute = require('./routes/product');
const express = require('express');
const morgan = require('morgan')
const cors = require('cors');
const app = express()


app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/user', userRoute);
app.use('/category', categoryRoute);
app.use('/product', productRoute);

module.exports = app
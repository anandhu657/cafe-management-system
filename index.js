const connection = require('./database/connection');
const userRoute = require('./routes/user');
const express = require('express');
const morgan = require('morgan')
const cors = require('cors');
const app = express()


app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/user', userRoute);

module.exports = app
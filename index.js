require('dotenv').config();
const {connect} = require('./data/connect.js');
connect();
const express = require('express');
const morgan = require('morgan');

const app = express();


app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded());

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT,()=>{
    console.log(`server is running on PORT ${PORT}`)
});
server.on('error',error=>{
    console.log(error.message);
})
require('dotenv').config();
require('./init.js');
require('./src/models/users.js');
const {connect} = require('./src/data/connect.js');
connect();
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const userRoutes = require('./src/routes/user-routes.js');
// const { raw } = require('express');
const {pageNotFound, errorHandler} = require('./src/middlewares/error.js');

const app = express();


app.use(morgan('combined'));
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.json());
app.use(express.urlencoded());

app.use('/auth',userRoutes);

app.use(pageNotFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT,()=>{
    console.log(`server is running on PORT ${PORT}`)
});
server.on('error',error=>{
    console.log(error.message);
})
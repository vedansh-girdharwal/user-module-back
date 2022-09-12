require('dotenv').config();
require('./init.js');
require('./src/models/users.js');
require('./src/models/userOTPVerification.js');
require('./src/models/passwordRequest.js');
const {connect} = require('./src/data/connect.js');
connect();
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const userRoutes = require('./src/routes/user-routes.js');
// const { raw } = require('express');
const {pageNotFound, errorHandler} = require('./src/middlewares/error.js');
const passport = require('passport');
const googleStrategy = require('passport-google-oauth20');
const mongoose = require('mongoose');
// const { JWT } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = mongoose.model('User');

const app = express();

passport.use(new googleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
},(accessToken,refreshToken,profile,done)=>{
    User.findOne(
        {email:profile.emails[0].value},
        async function (err,user){
            if(err){
                return done(err)
            }
            if(!user){
                const newuser = new User({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    imageUrl: profile.photos[0].value,
                    role: "standard",
                    verified: true
                });
                await User.create(newuser,async function(err,users){
                    if(err) console.log(err);
                    else {

                        user=users;
                        const claims = {
                            role: user.role,
                            email: user.email
                        }
                        jwt.sign(claims,process.env.JWT_SECRET_KEY, function(err,token){
                            if(err) throw err;
                            const data = {
                                token,
                                name:user.name,
                                role:user.role
                            }
                            console.log(data);
                            return done(null,data);
                        })
                    }
                })

            }
            else {const claims = {
                role: user.role,
                email: user.email
            }
            jwt.sign(claims,process.env.JWT_SECRET_KEY, function(err,token){
                if(err) throw err;
                const data = {
                    token,
                    name:user.name,
                    role:user.role
                }
                console.log(data);
                return done(null,data);
            })}
        }
    )
}))

app.use(morgan('combined'));
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

app.use(fileUpload({
    useTempFiles:true
}));

app.use('/auth',userRoutes);

app.use(pageNotFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
// if(process.env.NODE_ENV === "production"){
//     app.use(express.static(__dirname+"/dist/"));
//     app.get("*",(req,res)=>{
//         res.sendFile(__dirname+"/dist/index.html");
//     })
// }
const server = app.listen(PORT,()=>{
    console.log(`server is running on PORT ${PORT}`)
});
server.on('error',error=>{
    console.log(error.message);
})
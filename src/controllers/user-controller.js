const jwt = require('jsonwebtoken');
const {addUser,getUser,matchPassword} = require('../services/user-service.js');

const register = (req,res,next)=>{
    const user = req.body;
    if(Object.keys(user).length ===0){
        const httpError = new HttpError("Body is missing", 400);
        next(httpError);
        return;
    }
    addUser(user)
    .then(updatedUser=>{
        const data = {
            ...updatedUser.toObject()
        };
        delete data.password;
        res.status(201).json({
            status:"User created",
            data:data
        })
    })
    .catch(error=>{
        const httpError = new HttpError(error.message, 400);
        next(httpError);
    })
};

const login = (req,res,next)=>{
    const credentials = req.body;
    if(!(credentials?.email && credentials?.password)){
        const httpError = new HttpError("Wrong Credentials", 400);
        next(httpError);
        return;
    }
    const {email, password} = credentials;
    getUser(email)
    .then(usere=>{
        matchPassword(usere,password)
        .then(result=>{
            if(result){
                const claims = {
                    role: usere.role,
                    email: usere.email
                }
                jwt.sign(claims,process.env.JWT_SECRET_KEY,function(error,token){
                    if(error){
                        const httpError = new HttpError("jwt error",500);
                        next(httpError);
                    }
                    res.status(200).json({
                        message:"logged in successfully",
                        data:{
                            name: usere.name,
                            email: usere.email,
                            token
                        }
                    })
                })
            }else{
                res.status(401).json({
                    message:"auth failed"
                })
            }
        })
    })
    .catch(error=>{
        if(error.type === "BadCredentials"){
            const httpError = new HttpError("Bad Credentials",403);
            next(httpError)
        }else{
            const httpError = new HttpError(error.message,500);
            next(httpError)

        }
    })
}

module.exports = {
    register,
    login
}
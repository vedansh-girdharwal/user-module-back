const jwt = require('jsonwebtoken');
const {addUser,getUser:getUserByEmail,matchPassword,fetchUsers,changeUserRole,editProfile} = require('../services/user-service.js');
const {sendOTPEmail} = require('../services/user-otp-verification-service.js');
const cloudinary = require('cloudinary').v2;

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
        sendOTPEmail(updatedUser)
            .then(()=>{
                res.status(201).json({
                    status:"PENDING",
                    message:"Verification otp email sent",
                    data:data
                })
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
    getUserByEmail(email)
    .then(usere=>{
        const {verified} = usere;
        if(verified){
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
                                role: usere.role,
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
        }else{
            const httpError = new HttpError("Email is not verified",401);
            next(httpError);
        }
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

const getUser = (req,res,next)=>{
    const {authorization:token} = req.headers;
    let email='';
    jwt.verify( token, process.env.JWT_SECRET_KEY, function( err, claims ) {
        if( err ) {
            const error = new Error( 'Bad credentials' );
            // invalid user
            error.status = 401;
            next( error );
            return;
        }
        email = claims.email;
    });
    getUserByEmail(email)
        .then(user=>{
            if(!(user===null)){
                
                delete user._doc.password;
                delete user._doc.__v;
                res.status(201).json({
                    user
                })
            }else{
                res.status(400).json({
                    message:'Users not fetched'
                })
            }
        }).catch(error=>{
            const httpError = new HttpError(error.message,500);
            next(httpError);
        })
}

const getUsers = (req,res,next)=>{
    fetchUsers()
        .then(users=>{
            if(users.length>=1){
                users.forEach(user => {
                    delete user._doc.password;
                    delete user._doc.__v;
                });
                res.status(200).json({
                    users
                })
            }else{
                res.status(400).json({
                    message:'Users not fetched'
                })
            }
        }).catch(error=>{
            const httpError = new HttpError(error.message,500);
            next(httpError);
        })
}

const updateImage = (req,res,next)=>{
    const {id:userId}=req.params;
    const updates = {};
    
    if(req.files!==undefined){
        cloudinary.config({
            cloud_name: `${process.env.CLOUD_NAME}`,
            api_key: `${process.env.CLOUD_API_KEY}`,
            api_secret: `${process.env.CLOUD_API_SECRET}`
        })
        const photo = req.files.image;
        cloudinary.uploader.upload(photo.tempFilePath,(err,result)=>{
            if(err){
                const httpError = new HttpError(err.message,500);
                next(httpError);
            }else{
                updates.imageUrl = result.url;
                console.log(result)
                editProfile(userId,updates)
                .then(response=>{
                        if(response!==null){
                            delete response._doc.password;
                            delete response._doc.__v
                            res.status(203).json({
                                status:"UPDATED",
                                response
                            })
                        }
                    }).catch(error=>{
                        const httpError = new HttpError(error.message,500);
                        next(httpError);
                    })
            }
        })

    }
    // else{
    //     console.log(updates);
    //     editProfile(userId,updates)
    //                 .then(response=>{
    //                     if(response!==null){
    //                         delete response._doc.password;
    //                         delete response._doc.__v;
    //                         res.status(203).json({
    //                                 response
    //                             })
    //                     }    
    //                     }).catch(error=>{
    //                         const httpError = new HttpError(error.message,500);
    //                         next(httpError);
    //                     })
    // }
    // User.update({_id:userId},{$set:updates})
}

const updateProfile = (req,res,next)=>{
    const {id:userId}=req.params;
    const updates = {};
    for(const [key,value] of Object.entries(req.body)){
        updates[key]=value
    }
    delete updates.image;
    editProfile(userId,updates)
        .then(response=>{
            if(response!==null){
                delete response._doc.password;
                delete response._doc.__v;
                res.status(203).json({
                    status:"UPDATED",    
                    response
                    })
            }    
        }).catch(error=>{
            const httpError = new HttpError(error.message,500);
            next(httpError);
        })
}

const changeRole = (req,res,next)=>{
    const id = req.params.id;
    const {role:userRole} = req.body;
    if(!(id===null)||!(userRole===null)||!(userRole==='')){
        if(userRole==='admin'){
            changeUserRole(id,'standard')
                .then(result=>{
                    if(result){
                        res.status(200).json({
                            status:"UPDATED",
                            message:"User role is updated"
                        })
                    }else{
                        res.status(204).json({
                            status:"NOT_UPDATED",
                            message:"User role is not updated"
                        })
                    }
                }).catch(error=>{
                    const httpError = new HttpError(error.message,500);
                    next(httpError);
                });
        }else{
            changeUserRole(id,'admin')
                .then(result=>{
                    if(result){
                        res.status(200).json({
                            status:"UPDATED",
                            message:"User role is updated"
                        })
                    }else{
                        res.status(204).json({
                            status:"NOT_UPDATED",
                            message:"User role is not updated"
                        })
                    }
                }).catch(error=>{
                    const httpError = new HttpError(error.message,500);
                    next(httpError);
                });
        }
    }
}

module.exports = {
    register,
    login,
    getUsers,
    getUser,
    updateProfile,
    updateImage,
    changeRole
}
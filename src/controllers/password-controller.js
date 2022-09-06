const {sendResetPasswordEmail, changePassword} = require('../services/password-services.js');
const {getUser} = require('../services/user-service.js');

const sendResetLink = (req,res,next)=>{
    const {email} = req.body;
    getUser(email)
        .then(user=>{
            if(user!==null){
                sendResetPasswordEmail(email)
                    .then((result)=>{
                        if(result){
                            res.status(201).json({
                                status:"SENT",
                                message:"Password reset email has been sent"
                            })
                        }
                    }).catch(error=>{
                        const httpError = new HttpError(error.message,500);
                        next(httpError);
                    })
            }else{
                res.status(400).json({
                    status:"INVALID",
                    message:"Email is invalid"
                })
            }
    }).catch(error=>{
            const httpError = new HttpError(error.message,500);
            next(httpError);
        })
};

const resetPassword = (req,res,next)=>{
    const id = req.params.id;
    const {password:newPass} = req.body;
    changePassword(id,newPass)
        .then(result=>{
            if(result){
                res.status(201).json({
                    status:"UPDATED",
                    message:`Password has been updated`
                })
            }else{
                res.status(201).json({
                    status:"TIMEOUT",
                    message:`Password reset link is expired`
                })
            }
        }).catch(error=>{
            const httpError = new HttpError(error.message,401);
            next(httpError);
        })
}

module.exports = {
    sendResetLink,
    resetPassword
}
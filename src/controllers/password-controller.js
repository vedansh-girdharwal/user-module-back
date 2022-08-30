const {sendResetPasswordEmail, changePassword} = require('../services/password-services.js');
const sendResetLink = (req,res,next)=>{
    const {email} = req.body;
    sendResetPasswordEmail(email)
        .then((result)=>{
            if(result){
                res.status(201).json({
                    status:"SENT",
                    message:"Password reset email has been sent"
                })
            }
        }).catch(error=>{
            const httpError = new HttpError(error.message,201);
            next(httpError);
        })
};

const resetPassword = (req,res,next)=>{
    const id = req.params.id;
    const newPass = req.body;
    changePassword(id,newPass)
        .then(result=>{
            if(result){
                res.status(201).json({
                    status:"UPDATED",
                    message:"Password has been updated"
                })
            }else{
                res.status(201).json({
                    status:"TIMEOUT",
                    message:"Password reset link has been expired"
                })
            }
        }).catch(error=>{
            const httpError = new HttpError(error.message,201);
            next(httpError);
        })
}

module.exports = {
    sendResetLink,
    resetPassword
}
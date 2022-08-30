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
    const {password:newPass} = req.body;
    changePassword(id,newPass)
        .then(result=>{
            if(result==="UPDATED"){
                res.status(201).json({
                    status:"UPDATED",
                    message:`${result}`
                })
            }else{
                res.status(201).json({
                    status:"TIMEOUT",
                    message:`${result}`
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
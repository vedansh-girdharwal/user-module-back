const {otpVerification, getOTPVerificationRecord} = require('../services/user-otp-verification-service.js');

const verifyOTP = (req,res,next)=>{
    const userId = req.params.id;
    const otp = req.body;
    if(!userId || !otp){
        const httpError = new HttpError("Input is missing", 400);
        next(httpError);
        return;
    }else{
        getOTPVerificationRecord(userId)
            .then(record=>{
                if(record.length <=0){
                    const httpError = new HttpError("Account doesn't exist or has been already verified", 400);
                    next(httpError);
                    return;
                }else{
                    otpVerification(record,otp)
                        .then((result)=>{
                            if(result){
                                res.status(200).json({
                                    status:'VERIFIED',
                                    message: 'User email verified successfully'
                                })
                            }
                        })
                }
            }).catch(error=>{
                const httpError = new HttpError(error.message, 400);
                next(httpError);
            })
    }
}

module.exports = {
    verifyOTP
}
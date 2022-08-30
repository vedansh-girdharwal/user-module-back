const mongoose = require('mongoose');
const User = mongoose.model('User');
const UserOTPVerification = mongoose.model('UserOTPVerification');
// const {v4: uuidv4} = require('uuid');
const nodeMailer = require('nodemailer');
const bcrypt = require('bcrypt');

let transporter = nodeMailer.createTransport({
    host: "smtp-mail.outlook.com",
    auth:{
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    }
});

transporter.verify((error,success)=>{
    if(error){
        console.log(error);
    }else{
        console.log('transporter ready');
        console.log(success);
    }
})

const sendOTPEmail = ({_id,email})=>{
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Verify your Email",
        html: `<p> Enter <b>${otp}</b> in the app to verify your email address and continue to login.</p> <p>This code <b>expires in 1 hour</b>.</p>`,
    };

    const salt = 10;
    return bcrypt.hash(otp,salt)
        .then((hashedOTP)=>{
            const userOTPVerification = new UserOTPVerification({
                userId: _id,
                otp: hashedOTP,
                createdAt: Date.now(),
                expiresAt: Date.now()+3600000
            });
            return userOTPVerification.save()
                .then(()=>{
                    return transporter.sendMail(mailOptions)
                })
        }).catch(error=>{
            throw error;
        })
}

const getOTPVerificationRecord = (userId) =>{
    return UserOTPVerification.find({userId})
        .then(record=>{
            return record;
        })
}

const otpVerification = (record, simpleOtp)=>{
    const {expiresAt} = record[0];
    const {otp} = record[0];
    const {userId} = record[0];
    if(expiresAt < Date.now()){
        return UserOTPVerification.deleteMany({userId})
            .then(()=>{
                const err = new Error("OTP has expired. Please request for a new OTP");
                throw err;
            })
    }else{
        return bcrypt.compare(simpleOtp.otp,otp)
            .then((result)=>{
                if(result){
                    return User.updateOne({_id: userId},{verified:true})
                    .then(()=>{
                        return UserOTPVerification.deleteMany({userId})
                            .then(()=>{
                                return true;
                            })
                    })
                }else{
                    return false;
                }
            }).catch(error=>{
                throw error;
            })
    }
}

const deleteOTPVerificationRecord = (userId)=>{
    return UserOTPVerification.findOne({userId})
        .then((record)=>{
            if(record===null){
                const error = new Error('Bad Credentials');
                error.type = "BadCredentials";
                throw error;
            }
            return UserOTPVerification.deleteMany({userId})
        }).catch(error=>{
            throw error;
        })
}

module.exports = {
    sendOTPEmail,
    getOTPVerificationRecord,
    otpVerification,
    deleteOTPVerificationRecord
}
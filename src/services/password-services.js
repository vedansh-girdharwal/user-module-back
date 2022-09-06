const mongoose = require('mongoose');
const User = mongoose.model('User');
const PasswordRequest = mongoose.model('PasswordRequest');
const nodeMailer = require('nodemailer');

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

const sendResetPasswordEmail = (email)=>{
    const passwordRequest = {
        createdAt: Date.now(),
        email: email
    };
    // return PasswordRequest.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 120 })
    //     .then(()=>{
            return PasswordRequest.create(passwordRequest)
                .then((record)=>{
                    const {_id} = record;
                    const link = `http://localhost:8080/resetPassword/${_id}`;
                    return transporter.sendMail({
                        from: process.env.AUTH_EMAIL,
                        to: email,
                        subject: "Reset Password",
                        html: `<p> Click on the given link to reset your password. <b>${link}</b></p> <p>This link <b>expires in 1 hour</b>.</p>`,
                        })
                        .then(()=>{
                            return true;
                        })
                // })
        }).catch(error=>{
            throw error;
        })
}

const changePassword = (id, newPassword)=>{
    return PasswordRequest.find({_id:id})
        .then(record=>{
            if(!(record === null)){
                const {email} = record[0];
                    return User.findOne({email})
                        .then((user)=>{
                            user.password = newPassword;
                            return user.save()
                                .then(()=>{
                                    return PasswordRequest.deleteMany({_id:id})
                                        .then(()=>{
                                            return true
                                        })
                                })    
                        })
            }else{
                return false;
            }
        }).catch(error=>{
            throw error;
        })
}

module.exports = {
    sendResetPasswordEmail,
    changePassword
}
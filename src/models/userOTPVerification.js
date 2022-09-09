const mongoose = require('mongoose');

const userOTPVerificationSchema = new mongoose.Schema({
    createdAt:{
        type: Date,
        expires:7200
    },
    userId:{
        type: String,
        required: true,
    },
    otp:{
        type: String
    },
    expiresAt:{
        type: Date
    }
});

mongoose.model("UserOTPVerification",userOTPVerificationSchema);

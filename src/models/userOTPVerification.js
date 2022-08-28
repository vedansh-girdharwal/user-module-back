const mongoose = require('mongoose');

const userOTPVerificationSchema = new mongoose.Schema({
    userId:{
        type: String,
        required: true,
    },
    otp:{
        type: String
    },
    createdAt:{
        type: Date
    },
    expiresAt:{
        type: Date
    }
});

mongoose.model("UserOTPVerification",userOTPVerificationSchema);

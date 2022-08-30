const mongoose = require('mongoose');

const passwordRequestSchema = new mongoose.Schema({
    createdAt:{
        type: Date
    },
    email:{
        type: String,
        required: true,
        unique: true
    }
});

mongoose.model("PasswordRequest",passwordRequestSchema);
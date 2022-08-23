const mongoose = require('mongoose');
const User = mongoose.model('User');

const addUser = (user)=>{
    return User.find({
        email:user.email
    }).then(account=>{
        if(account.length >=1){
            const err = new Error('email already exist')
            throw err; 
        }
        else{
            return User.create(user)
        }
    })
    .catch(error=>{
        if(error.name === 'CastError'){
            const dbError = new Error(`Data type0 error : ${error.message}`);
            dbError.type = 'CastError';
            throw dbError;
        }
         if(error.name === 'ValidationError'){
            const dbError = new Error(`Validation error : ${error.message}`);
            dbError.type = 'ValidationError';
            throw dbError;
        }
        throw error;
    })
}

const getUser = (email)=>{
    return User.findOne({
        email
    }).then(user=>{
        if(user===null){
            const error = new Error('Bad Credentials');
            error.type = "BadCredentials";
            throw error;
        }
    })
    .catch(error=>{
        error.type = "BadCredentials"
        throw error;
    })
};

const matchPassword = (user, typedPassword)=>{
    return user.checkPassword(typedPassword)
    .then(result=>{
        if(!result){
            const error = new Error("Bad Credentials");
            error.type = "BadCredentials";
            throw error
        }
    })
    .catch(error=>{
        const err = new Error(error.message);
        err.type = "DBError";
        throw err
    })
}
module.exports = {
    addUser,
    getUser,
    matchPassword
}
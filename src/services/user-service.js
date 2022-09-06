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
        return user;
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
        return result;
    })
    .catch(error=>{
        const err = new Error(error.message);
        err.type = "DBError";
        throw err
    })
}

const getUserById = (userId)=>{
    return User.findById(userId)
        .then(user=>{
        if(user===null){
            const error = new Error('Bad Credentials');
            error.type = "BadCredentials";
            throw error;
        }
        return user;
    })
    .catch(error=>{
        error.type = "BadCredentials"
        throw error;
    })
}

const deleteUser = (userId)=>{
    return User.findByIdAndDelete(userId)
        .then(result=>{
            if(result){
                return true;
            }else{
                const error = new Error('Bad Credentials');
                throw error;
            }
        }).catch(error=>{
            throw error;
        })
}

const fetchUsers = ()=>{
    return User.find()
        .then(users=>{
            return users;
        }).catch(error=>{
            const err = new Error(error.message);
            throw err;
        })
}

const editProfile = (userId,updates)=>{
    return User.findByIdAndUpdate(userId,{$set:updates})
        .then(response=>{
            return response
        }).catch(error=>{
            const err = new Error(error.message);
            throw err;
        })
}

const changeUserRole = (id,newRole)=>{
    return User.findByIdAndUpdate(id, {role:newRole})
        .then((res)=>{
            return res;
        }).catch(error=>{
            const err = new Error(error.message);
            throw err;
        })
}

module.exports = {
    addUser,
    getUser,
    matchPassword,
    getUserById,
    fetchUsers,
    editProfile,
    changeUserRole,
    deleteUser
}
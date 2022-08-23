const mongoose = require('mongoose');

mongoose.set('returnOriginal',false);
mongoose.set('runValidators',true);

const user = process.env.USER_NAME;
const password = process.env.PASSWORD;
const host = process.env.DB_HOST;

const connect = ()=>{
    return mongoose.connect(`mongodb+srv://${user}:${password}@${host}/userModuleDB?retryWrites=true&w=majority`)
    .then(()=>{
        console.log('connected to db 🤓');
    })
    .catch(error=>{
        console.log(error.message);
    })
};

module.exports = {
    connect
}
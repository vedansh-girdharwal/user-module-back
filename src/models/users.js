const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type: String,
        default: 'standard',
        enum: ['admin','standard']
    },
    profileCreated:{
        type:String,
        default:new Date().toLocaleString('en-US', {timeZone: 'Asia/Kolkata',dateStyle:'long',timeStyle:'long'})
    },
    phone:{
        type:Number,
    },
    address:{
        type: String
    },
    gender:{
        type:String,
        default:"not mentioned",
        enum:['male','female','other',"not mentioned"]
    },
    imageUrl:{
        type:String,
        default:"http://res.cloudinary.com/dxur0nykf/image/upload/v1662311342/almr0inoyeasiunshszw.jpg"
    },
    verified:{
        type: Boolean,
        default: false
    }
});

const emailPat = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ ;
const passwordPat = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;

userSchema.path('email').validate(
    email=> emailPat.test(email),
    "Invalid email."
);
userSchema.path('password').validate(
    password=> passwordPat.test(password),
    "Invalid password. Password must contain 1 uppercase, 1 lowercase, 1 number, 1 special character and must be atleast 8 characters long"
);
const SALT_FACTOR = 10;
userSchema.pre('save',function(done){
    const user = this;
    if(!user.isModified('password')){
        done();
        return;
    }
    bcrypt.genSalt(SALT_FACTOR, function(err,salt){
        if(err){
            return done(err);
        }
        bcrypt.hash(user.password, salt,function(err,hashedPassword){
            if(err){
                return done(err);
            }
            user.password = hashedPassword;
            done();
        })
    })
});
userSchema.post('updateOne',function(){
    const user = this;
    // if(!user.isModified('password')){
    //     done();
    //     return;
    // }
    bcrypt.genSalt(SALT_FACTOR, function(err,salt){
        if(err){
            return err;
        }
        bcrypt.hash(user.password, salt,function(err,hashedPassword){
            if(err){
                return err;
            }
            user.password = hashedPassword;
            
        })
    })
});

userSchema.methods.checkPassword = async function(simplePassword){
    const hashedPassword = this.password;
    const isMatched = await bcrypt.compare(simplePassword, hashedPassword);
    return isMatched;
};

mongoose.model('User',userSchema);

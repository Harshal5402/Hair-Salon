const mongoose = require("mongoose");

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');



const registerSchema = new mongoose.Schema({
    firstname : {
        type : String,
        require : true
    },
    lastname : {
        type : String,
        require : true
    },
    emailid : {
        type : String,
        require : true,
        unique : true
    },
    contact : {
        type : String,
        require : true,
        unique : true
    },
    gender : {
        type : String,
        require : true
    },
    password : {
        type : String,
        require : true
    },
    confirmpassword : {
        type : String,
        require : true
    },
    tokens : [{
        token : {
            type : String,
            require : true
        }
    }]
})

// generating tokens
registerSchema.methods.gernerateAuthToken = async function (){
    try {
        const token = jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token : token})
        await this.save();
        return token;
    } catch (error) {
        res.send("the error part" + error);
        console.log("the error part" + error);
    }
}

registerSchema.pre("save", async function(next) {
 
    if(this.isModified("password")){
        // console.log(`This is current password is ${this.password}`);
        this.password = await bcrypt.hash(this.password, 10);
        this.confirmpassword = await bcrypt.hash(this.confirmpassword, 10);

        // console.log(`This is current password is ${this.password}`);

        // this.confirmpassword = undefined;
    }
    next();
});

// now we need to create a collection

const Register = new mongoose.model("Register", registerSchema);

module.exports = Register;
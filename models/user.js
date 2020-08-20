const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

//create a schema
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true,
        required: false
    },
    first_name: {
        type: String,
        required: false
    },

    sex: {
        type: String,
        required: false
    },
    middle_name: {
        type: String,
        required: false
    },

    last_name: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: false
    },
    year: {
        type: String,
        required: false
    },
    joindate: {
        type: Date,
        default: Date.now
    },
    birthday: {
        type: Date,
    },
    about: {
        type: String,
        required: false
    },
    fb: {
        type: String,
        required: false
    },
    github: {
        type: String,
        required: false
    },
    codepen: {
        type: String,
        required: false
    },
    insta: {
        type: String,
        required: false
    },
    google: {
        type: String,
        required: false
    },

});

userSchema.pre('save', async function (next) {
    try {
        //generate a salt
        const salt = await bcrypt.genSalt(10);
        //generate password
        const passwordHash = await bcrypt.hash(this.password, salt);
        //reassign hashed version over original
        this.password = passwordHash;
        next();
    }
    catch (error) {
        next(error);
    }
});

userSchema.methods.isValidPassword = async function (newPassword) {
    try {
        return await bcrypt.compare(newPassword, this.password)
    } catch (error) {
        throw new Error(error)
    }
}

//create a model
const User = mongoose.model('user', userSchema)

//export the model
module.exports = User;


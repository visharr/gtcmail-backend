const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

//create a schema
const userSchema = new Schema({
    email: {
        type: String,
        required: true,       
    },
    uname: {
        type: String,
        required: false
    },
    fname: {
        type: String,
        required: false
    },
    mname: {
        type: String,
        required: false
    },
    lname: {
        type: String,
        required: false
    },
    branch: {
        type: String,
        required: false
    },
    year: {
        type: String,
        required: false
    },
    deletedate: {
        type: Date,
        default: Date.now
    },
    joindate: {
        type: Date,
        
    },
    about: {
        type: String,
        required: false
    },

});

//create a model
const OldUser = mongoose.model('oldUser', userSchema)

//export the model
module.exports = OldUser;


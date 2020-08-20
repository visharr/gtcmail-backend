const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

//create a schema
const outboxSchema = new Schema({
    to: {
        type: String,
        required: true
    },
    from: {
        type: String,
        required: true
    },
    receiverName: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },   
    read: {
        type: Boolean,
        default: false
    }, 
    time: {
        type: Date,
        default: Date.now
    },
});

// userSchema.pre('save', async function (next) {
//     try {
//         //generate a salt
//         const salt = await bcrypt.genSalt(10);
//         //generate password
//         const passwordHash = await bcrypt.hash(this.password, salt);
//         //reassign hashed version over original
//         this.password = passwordHash;
//         next();
//     }
//     catch (error) {
//         next(error);
//     }
// });

//create a model
const Outbox = mongoose.model('outbox', outboxSchema)

//export the model
module.exports = Outbox;


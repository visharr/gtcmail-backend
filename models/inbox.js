const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create a schema
const inboxSchema = new Schema({
    to: {
        type: String,
        required: true
    },
    senderName: {
        type: String,
        required: true
    },
    from: {
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
const Inbox = mongoose.model('inbox', inboxSchema)

//export the model
module.exports = Inbox;


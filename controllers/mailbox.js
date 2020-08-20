const JWT = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Inbox = require('../models/inbox');
const Outbox = require('../models/outbox');
const User = require('../models/user');
const { JWT_secret } = require('../configuration');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
// Connection URL
const url = 'mongodb://127.0.0.1:27017';
// Database Name
const dbName = 'APIAuthentication';



module.exports = {

    inbox: async (req, res, next) => {
        const msg = await Inbox.find({ "to": req.user.id }).sort('-time')
        var unread = await Inbox.find({ "to": req.user.id, "read": false })
        unread = unread.length
        res.status(200).json({ msg, unread });
    },

    outbox: async (req, res, next) => {
        const msg = await Outbox.find({ "from": req.user._id }).sort('-time')
        res.status(200).json(msg);
    },

    read: async (req, res, next) => {
        await Inbox.findOneAndUpdate({ "_id": req.params.id, "to": req.user._id }, { read: true });
        await Outbox.findOneAndUpdate({ "_id": req.params.id, "to": req.user._id }, { read: true });
        return res.status(200).json();
    },

    unread: async (req, res, next) => {
        await Inbox.findOneAndUpdate({ "_id": req.params.id, "to": req.user._id }, { read: false });
        res.status(200).json();
    },

    getInboxMessage: async (req, res, next) => {
        const msg = await Inbox.findOne({ "_id": req.params.id, "to": req.user._id });
        res.status(200).json(msg);
    },

    deleteInboxMessage: async (req, res, next) => {
        await Inbox.findByIdAndRemove(req.params.id);
        return res.status(200).json();
    },
    deleteOutboxMessage: async (req, res, next) => {
        await Outbox.findByIdAndRemove(req.params.id);
        return res.status(200).json();
    },

    getOutboxMessage: async (req, res, next) => {
        const msg = await Outbox.findOne({ "_id": req.params.id, "from": req.user._id });
        res.status(200).json(msg);
    },

    send: async (req, res, next) => {
        const from = req.user._id;
        var { to, subject, message } = req.body;
        if (subject === '' || subject === null) {
            subject = 'No Subject';
        }
        receiver = await User.findOne({ "username": to });
        to = receiver._id;

        receiverName = receiver.first_name + " " + receiver.last_name;
        senderName = req.user.first_name + " " + req.user.last_name;
       
        const ibx = new Inbox({ to, senderName, from, subject, message });
        ibx.save();
        const obx = new Outbox({ to, receiverName, from, subject, message });
        obx.save();
        res.status(200).json();
    },
}
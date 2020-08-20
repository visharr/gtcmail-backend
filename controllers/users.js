const JWT = require('jsonwebtoken');

const OldUser = require('../models/oldUser');
const User = require('../models/user');
const { JWT_secret } = require('../configuration');

const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override')

const url = 'mongodb://vishal:asgaeaf334@ds127878.mlab.com:27878/heroku_fnf8g5jn';
mongoose.connect(url);
const conn = mongoose.createConnection(url);

signToken = (user) => {
    return JWT.sign({
        iss: 'gtc',
        sub: user._id,
        iat: new Date().getTime(),
        exp: new Date().setDate(new Date().getDate() + 1)
    }, JWT_secret);
};

conn.once('open', () => {
    //Init Stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('pfps');
    // all set!
})

module.exports = {

    signUp: async (req, res, next) => {
        const { email, password, first_name, last_name, username, year, sex, branch, birthday } = req.body;
        //check if there is user with same email
        var foundUser = await User.findOne({ email });
        if (foundUser) {
            return res.status(404).json({ error: "email is already in use" });
        }

        foundUser = await User.findOne({ username });
        if (foundUser) {
            return res.status(404).json({ error: "username is already in use" });
        }

        //create new user
        const newUser = new User({ email, password, first_name, last_name, username, year, branch, sex, birthday });
        await newUser.save();
        //generate token
        const token = signToken(newUser);
        //response with token        
        res.status(200).json({ token });
    },

    signIn: async (req, res, next) => {
        var user = await User.findOne({ _id: req.user._id });
        user = user.toJSON();
        delete user.password;
        const token = signToken(req.user);
        res.status(200).json({ token, user })

    },

    deleteUser: async (req, res, next) => {
        var foundUser = await User.findOne({ email: req.user.email });
        if (foundUser) {
            const isMatch = await foundUser.isValidPassword(req.body.password);
            if (!isMatch) {
                return res.status(404).json({ error: "Invalid Password" });
            }
            foundUser = foundUser.toJSON();
            delete foundUser._id;
            const toDelete = new OldUser(foundUser);
            await toDelete.save();
            await gfs.remove({ filename: req.user._id.toString(), root: 'pfps' });
            await User.findByIdAndRemove(req.user._id);
            return res.status(200).json({ "deleted": toDelete });
        }
        return res.status(404).json({ error: "Invalid User" });
    },

    updatePfp: async (req, res, next) => {
        res.status(200).json({ file: req.file });
    },

    deletePfp: async (req, res, next) => {
        gfs.files.findOne({ filename: req.user._id.toString() }, (err, file) => {
            //Check if Files exist
            // console.log(req.user._id)
            if (!file || file.length === 0) {
                return res.status(404).json({ err: err })
            }
            gfs.remove({ filename: req.user._id.toString(), root: 'pfps' }, (err) => {
                if (err) {
                    return res.status(404).json({ err: err });
                }
                return res.status(200).json({ 'message': 'removed' });
            });
        });

    },

    getpfp: async (req, res, next) => {
        await gfs.files.findOne({ filename: req.user._id.toString() }, (err, file) => {
            //Check if Files exist
            if (!file || file.length === 0) {
                return res.status(404).json({
                    err: "No file exists"
                });
            }

            //Check if image
            if (file.contentType === ('image/jpeg') || file.contentType === ('image/png')) {
                //read output to browser                
                var readstream = gfs.createReadStream(file.filename);
                readstream.pipe(res);
                //res.json(file);
            }
            else {
                return res.status(404).json({
                    err: "Not an image"
                });
            }
        });
    },

    pfp: async (req, res, next) => {
        await gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
            //Check if Files exist
            if (!file || file.length === 0) {
                return res.status(404).json({
                    err: "No file exists"
                });
            }

            //Check if image
            if (file.contentType === ('image/jpeg') || file.contentType === ('image/png')) {
                //read output to browser                
                var readstream = gfs.createReadStream(file.filename);
                readstream.pipe(res);
                //res.json(file);
            }
            else {
                return res.status(404).json({
                    err: "Not an image"
                });
            }
        });

    },

    // ispfp: async (req, res, next) => {
    //     await gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    //         //Check if Files exist
    //         if (!file || file.length === 0) {
    //             return res.status(202).json({
    //                 pfp: "no"
    //             });
    //         }
    //         //Check if image
    //         if (file.contentType === ('image/jpeg') || file.contentType === ('image/png')) {
    //             return res.status(202).json({
    //                 pfp: "yes",
    //                 pfppath: "//localhost:3000/users/pfp/" + req.filename
    //             });
    //         }
    //         else {
    //             return res.status(404).json({
    //                 err: "Not an image"
    //             });
    //         }
    //     });
    // },

    getUser: async (req, res, next) => {
        var user = req.user.toJSON();
        delete user.password;

        await gfs.files.findOne({ filename: user._id.toString() }, (err, file) => {
            //Check if Files exist
            if (!file || file.length === 0) {
                return res.json(user);
            }
            else if (file.contentType === ('image/jpeg') || file.contentType === ('image/png')) {
                pfppath = "//localhost:3000/users/pfp/" + user._id;
                user['pfp'] = pfppath;
                return res.status(200).json(user);
            }
            else {
                return res.json(user);
            }
        });
    },

    profile: async (req, res, next) => {
        var profile = await User.findOne({ _id: req.params.idd });
        if (profile) {
            profile = profile.toJSON();
            delete profile.password;
            await gfs.files.findOne({ filename: profile._id.toString() }, (err, file) => {
                //Check if Files exist
                if (!file || file.length === 0) {
                    return res.status(200).json(profile);
                }
                else if (file.contentType === ('image/jpeg') || file.contentType === ('image/png')) {
                    pfppath = "//localhost:3000/users/pfp/" + profile._id;
                    profile['pfp'] = pfppath;
                    return res.status(200).json(profile);
                }
                else {
                    return res.status(200).json(profile);
                }
            });
        }
        else { return res.status(404).json({ err: err }); }
    },

    profiles: async (req, res, next) => {
        var profiles = await User.find();
        if (profiles) {
            return res.status(200).json(profiles);
        }
        else { return res.status(404).json({ err: err }); }
    },

    profile: async (req, res, next) => {

        var profile = await User.findOne({ _id: req.params.idd });

        if (profile) {
            profile = profile.toJSON();
            delete profile.password;

            await gfs.files.findOne({ filename: profile._id.toString() }, (err, file) => {
                //Check if Files exist
                if (!file || file.length === 0) {
                    return res.status(200).json(profile);
                }
                else if (file.contentType === ('image/jpeg') || file.contentType === ('image/png')) {
                    pfppath = "//localhost:3000/users/pfp/" + profile._id;
                    profile['pfp'] = pfppath;
                    return res.status(200).json(profile);
                }
                else {
                    return res.status(200).json(profile);
                }
            });
        }
        else {
            var deletedProfile = await OldUser.findOne({ _id: req.params.idd });
            if (deletedProfile) {
                return res.status(200).json({ "user": "deleted" })
            }
            else { return res.status(404).json({ err: err }); }

        }

    },

    checkAvailibility: async (req, res, next) => {
        const user = await User.findOne({ email: req.body.email })
        if (!user) {
            return res.status(200).json({ "availbility": true });
        }
        else {
            await gfs.files.findOne({ filename: user._id.toString() }, (err, file) => {
                //Check if Files exist
                if (!file || file.length === 0) {
                    pfppath = "null";
                    return res.status(200).json({ "id": user._id, "sex": user.sex, "availbility": false });
                }
                else if (file.contentType === ('image/jpeg') || file.contentType === ('image/png')) {
                    pfppath = "//localhost:3000/users/pfp/" + user._id;
                    return res.status(200).json({ "pfp": pfppath, "id": user._id, "availbility": false });
                }
                else {
                    return res.status(200).json({ "id": user._id, "sex": user.sex, "availbility": false });
                }
            });
        }
    },

    checkUsernameAvailibility: async (req, res, next) => {
        const user = await User.findOne({ username: req.body.username })
        if (!user) {
            return res.status(200).json({ "availbility": true });
        }
        else {
            await gfs.files.findOne({ filename: user._id.toString() }, (err, file) => {
                //Check if Files exist
                if (!file || file.length === 0) {
                    pfppath = "null";
                    return res.status(200).json({ "id": user._id, "availbility": false });
                }
                else if (file.contentType === ('image/jpeg') || file.contentType === ('image/png')) {
                    pfppath = "//localhost:3000/users/pfp/" + user._id;
                    return res.status(200).json({ "pfp": pfppath, "id": user._id, "availbility": false });
                }
                else {
                    return res.status(200).json({ "id": user._id, "availbility": false });
                }
            });
        }
    }
}


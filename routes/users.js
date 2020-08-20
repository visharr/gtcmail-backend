const router = require('express-promise-router')();
const passport = require('passport');
const passportConf = require('../passport');

const { validateBody, schemas } = require('../helpers/routehelpers');
const UsersController = require('../controllers/users');

const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override')

const url = process.env.MONGODB_URI;
mongoose.connect(url);
const conn = mongoose.createConnection(url);
conn.once('open', () => {
    //Init Stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('pfps');
    // all set!
})
//Create Storage Engine
const storage = new GridFsStorage({
    url: url,
    file: (req, file) => {
        gfs.files.findOne({ filename: req.user._id.toString() }, (err, file) => {
            //Check if Files exist           
            if (!(!file || file.length === 0)) {
                gfs.remove({ filename: req.user._id.toString(), root: 'pfps' }, (err) => {
                    if (err) {
                        return res.status(404).json({ err: err });
                    }
                });
            }

        });

        return new Promise((resolve, reject) => {

            const filename = req.user._id.toString();// buf.toString('hex') + path.extname(file.originalname);
            const fileInfo = {
                filename: filename,
                bucketName: 'pfps'
            };
            resolve(fileInfo);
        });
    }
});
const upload = multer({ storage });


router.route('/signup')
    .post(UsersController.signUp);

router.route('/signin')
    .post(validateBody(schemas.authSchema), passport.authenticate('local', { session: false }), UsersController.signIn);

router.route('/available')
    .post(UsersController.checkAvailibility)

router.route('/availableusername')
    .post(UsersController.checkUsernameAvailibility)

router.route('/getuser')
    .get(passport.authenticate('jwt', { session: false }), UsersController.getUser)

router.route('/deleteuser')
    .post(passport.authenticate('jwt', { session: false }), UsersController.deleteUser)

router.route('/profile/:idd')
    .get(passport.authenticate('jwt', { session: false }), UsersController.profile)

router.route('/profiles/')
    .get(passport.authenticate('jwt', { session: false }), UsersController.profiles)

router.route('/updatepfp')
    .post(passport.authenticate('jwt', { session: false }), upload.single('img'), UsersController.updatePfp);

router.route('/deletepfp')
    .delete(passport.authenticate('jwt', { session: false }), UsersController.deletePfp);

router.route('/getpfp')
    .get(passport.authenticate('jwt', { session: false }), UsersController.getpfp)

router.route('/pfp/:filename')
    .get(UsersController.pfp)

// router.route('/ispfp/:filename')
//     .get(UsersController.ispfp)


module.exports = router;
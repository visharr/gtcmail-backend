const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override')

const url = 'mongodb://127.0.0.1:27017/APIAuthentication';


mongoose.connect(url);
const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/APIAuthentication');


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
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'pfps'
                };
                resolve(fileInfo);
            });
        });
    }
});
const upload = multer({ storage });


const app = express();

//Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

//Init gfs
let gfs;


//Routes
app.use('/users', require('./routes/users'));
app.use('/mailbox', require('./routes/mailbox'));

//Start the server
const port = process.env.PORT || 3000;
app.listen(port);
console.log('Server is listening at ' + port);
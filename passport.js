const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const { JWT_secret } = require('./configuration');
const User = require('./models/user');
const LocalStrategy = require('passport-local').Strategy;

//JWT Token Strategy
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: JWT_secret
}, async (payload, done) => {
    try {
        //find user specified in token
        const user = await User.findById(payload.sub);

        //if user does not exist handle it
        if (!user) {
            return done(null, false);
        }
        
        //otherwise return the user
        done(null, user)
    }
    catch (error) {
        done(error, false);
    }
}));

//local Strategy
passport.use(new LocalStrategy({
    usernameField: 'user',

}, async (username, password, done) => {
    try {
        //find the user given the email
        var user = await User.findOne({ email: username });

        if (!user) {
            var user = await User.findOne({ username: username });
        }
        //if not
        if (!user) {
            return done(null, false);
        }

        //check if the password is correct
        const isMatch = await user.isValidPassword(password);

        //if not
        if (!isMatch) {
            return done(null, false);
        }

        //otherwise return the user
        done(null, user);
    }
    catch (error) {
        done(error, false);
    }
}));
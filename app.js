require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');
const shortid = require('shortid');
var GoogleStrategy = require('passport-google-oauth20').Strategy;


const port = process.env.PORT || 3000;
const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.LOCAL_DATABASE + '/shortlyDB');

const linksSchema = new mongoose.Schema({
  urlId: String,
  orginalUrl: String,
});

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    googleId: String,
    profilePhoto: String,
    links: [linksSchema]
}); 

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = mongoose.model('User', userSchema);
passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
    done(null, user);
});
  
passport.deserializeUser(function(user, done) {
  done(null, user);
});

// Google oauth
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/short"
},
function(accessToken, refreshToken, profile, cb) {
  let img = profile._json.picture;
  img = img.substring(0, img.length - 6);
  User.findOrCreate({ googleId: profile.id, profilePhoto: img }, function (err, user) {
    console.log(profile);
    return cb(err, user);
  });
}
));

app.get('/', (req, res)=>{
  res.render('home');
  host = req.headers.host;
});


app.get('/signup', (req, res)=>{
  res.render('signup')
});

app.post('/signup', (req, res)=>{
  User.register({username: req.body.username}, req.body.password, (err, user)=>{
    if(err){
      console.log(err);
      res.redirect('/signup');
    }else{
      passport.authenticate('local')(req, res, ()=>{
        res.redirect('/short');
        console.log("signed up");
      });
    }
  });
});

app.get('/login', (req, res)=>{
  res.render('login')
});

app.post('/login', (req, res)=>{
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, (err)=>{
    if(err){
      console.log(err);
      res.redirect('/login');
    }else{
      passport.authenticate('local')(req, res, ()=>{
        res.redirect('/short');
      });
    }
  });

});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/short', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/short');
  });

app.get('/short', (req, res)=>{
    if(req.isAuthenticated()){
      User.findById({_id: req.user._id}, (err, user)=>{
        if(err){
          console.log(err);
        }else{
          res.render('short', {links:user.links, profilePhoto: user.profilePhoto, host:req.headers.host});
        }
      });
    }else{
        res.redirect('/signup');
    }
});

app.post('/short', (req, res)=>{

    const link = {
      urlId: shortid.generate(),
      orginalUrl: req.body.urlInput
    }

    User.findById(req.user._id, (err, foundUser)=>{
      if(err){
        console.log(err);
      }else{
        foundUser.links.push(link);
        foundUser.save((err)=>{
          if(err){
            console.log(err);
          }else{
            res.redirect('/short');
          }
        });
      }
    });
});

app.post('/logout', (req, res)=>{
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
})

app.get('/:shortId', (req, res, next)=>{
  const shortId = req.params.shortId;
  User.find((err, users)=>{
    if(err){
      console.log(err);
    }else{
      users.forEach((user)=>{
        user.links.forEach((link)=>{
          if(link.urlId === shortId){
            res.redirect(link.orginalUrl);
          }
        })
      });
    }
  });
});


app.listen(port, (req, res)=>{
    console.log("server is running on port " + port);
});
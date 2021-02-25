const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const ExpressError = require('./errorHandlers/ExpressError');

const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');

mongoose.connect("mongodb://localhost:27017/social", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error"));
db.once("open", () => {
  console.log("Database Connected");
});

const app = express();

app.engine('ejs',ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("css", path.join(__dirname, "css"));


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.static(path.join(__dirname,'dist')));

const sessionConfig = {
  secret:"thisissecret",
  resave:false,
  saveUninitialized:true,
  cookie: {
    httpOnly:true,
    expires: Date.now() + 1000* 60 * 60 * 24 * 7,
    maxAge: 1000* 60 * 60 * 24 * 7,
  }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()) );

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash("error");
  next();
})

app.use('/',postRoutes);
app.use('/',userRoutes);

app.all('*', (req,res,next) => {
  next(new ExpressError('Page Not Found!', 404));
})

app.use((err,req,res,next) => {
  const { statusCode= 500 } = err;
  if(!err.message) err.message = 'Something went wrong!';
  res.status(statusCode).render('error', {err});
})

app.listen(8080, () => {
  console.log("listening on port 8080");
});


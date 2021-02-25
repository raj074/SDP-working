const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Post = require("../models/post");
const { route } = require('./postRoutes');
const catchAsync = require('../errorHandlers/catchAsync');
const mongoose = require('mongoose');
const {isLoggedIn, Auth } = require('../middleware');
router.get('/register', (req,res) =>{
    res.render('register.ejs');
})

router.post('/register', catchAsync( async (req,res,next) =>{
    try{
        const { username, email, password } = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err =>{
            if(err) return next(err);
            req.flash("success", "Welcome to Social!");
            res.redirect("/");
        });
        
    }catch(e){
        req.flash('error', e.message);
        res.redirect('/register');
    }
    
}))


router.get('/login' ,(req,res) =>{
    res.render('login');
})


router.post("/login", passport.authenticate("local", { failureFlash:true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', "Logged in successfully!!");
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

router.get('/logout', (req,res) => {
    req.logout();
    req.flash('success', "Logged out successfully!!")
    res.redirect('/');
})

router.get('/userDetails', isLoggedIn, (req,res) =>{
    
    res.render('userDetails');
})

router.post("/userDetails/:id",isLoggedIn, Auth,async (req, res) => {
  const id = req.params.id;

  const { profile, status } = req.body;
  const user = await User.findById(id);
  user.profile = profile;
  user.status = status;
  await user.save();
  res.redirect("/");
});

router.get("/profile/:id",async (req,res) =>{
    const id = req.params.id;
    const user = await User.findById(id);
    const posts = await Post.find({author:user._id});
    res.render('profile', { user,posts });
})

module.exports = router;
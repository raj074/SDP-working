const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const { route } = require('./postRoutes');
const catchAsync = require('../errorHandlers/catchAsync');

router.get('/register', (req,res) =>{
    res.render('register.ejs');
})

router.post('/register', catchAsync( async (req,res) =>{
    try{
        const { username, email, password } = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        req.flash("success", "Welcome to Social!");
        res.redirect("/");
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
    res.redirect('/');
})

module.exports = router;
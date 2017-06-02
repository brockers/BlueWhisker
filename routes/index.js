var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");



router.get("/", function(req, res){
    res.render("landing");
})



//=================
//AUTH ROUTES
//=================
router.get("/register", function(req, res){
    res.render("register");
});
//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            return res.redirect("/register");
        } 
        passport.authenticate("local")(req, res, function(){
            res.redirect("/game");
        });
    });
});

//=================
//Login ROUTES
//=================
router.get("/login", function(req, res){
    res.render("login");
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/game",
    failureRedirect: "/login"
    }), function(req, res){
});

//=================
//LOGOUT
//=================
router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});


//=================
//MIDDLEWARE
//=================

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}




module.exports = router;
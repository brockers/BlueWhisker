var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
//var methodOverride = require("method-override");
var passport = require("passport")
var LocalStrategy = require("passport-local");
var User = require("./models/user");


//requiring routes
var indexRoutes = require("./routes/index");
var gameRoutes = require("./routes/game");



mongoose.connect("mongodb://localhost/bluewhisker");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

//methodOverride is for PUT/DELETE methods -- read docs
//app.use(methodOverride("_method"));



//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Mexican food is the best food in the world.",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});


app.use(indexRoutes);
app.use(gameRoutes);


//=================
//SERVER
//=================

//this fixes port/server to work locally or online
var port = process.env.PORT || 3000;

app.listen(port, function(){
    console.log("server running");
});
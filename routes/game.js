var express = require("express");
var router = express.Router();
var middleware = require("../middleware");



router.get("/game",middleware.isLoggedIn, function(req, res){
        res.render("game/index");  
});





module.exports = router;
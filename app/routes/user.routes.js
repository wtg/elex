var path = require('path');
var User = require('../models/user.model.js');

module.exports = function(app, cas) {
    app.get('/auth', cas.bounce, function ( req, res ) {

        //gets your rcsid from cas
        var rcsID = req.session.cas_user;

        //searches to see if rcsID is already in db
        User.findOne({'name' : rcsID}, function(err, user){
            if(err){ console.log(err); }
            else if(!user){
                var u = new User({
                    name : rcsID
                });
                u.save(function (err, saved) {
                    if (err) {
                        return console.log('error saving to db');
                    }else{
                        console.log("please?");
                    }
                })
            }

            res.sendFile(path.resolve('views/main_menu.html'));
        });
    });
}

var path    = require('path');
var config  = require('../../config.js');
var cms     = require('cms-api')(config.cms_api_token);
var Meeting = require('../models/meeting.model.js');
var Group   = require('../models/group.model.js');
var User    = require('../models/user.model.js');

module.exports = function(app, cas) {
    app.get('/meetings', function (req, res) {
        if(!req.session.cas_user) {
            res.redirect('/auth');
        }
        res.redirect('/groups');
    });

    app.get('/meetings/:key', cas.bounce, function (req, res) {
        var rcsID = req.session.cas_user.toLowerCase;
        var rcsID = "etzinj";
        User.findOne({'name' : rcsID}, function(err, user) {
            Group.findOne({"_id" : req.params.key}, function(err, group){
    			if(group["admin"] == user["ID"]){
                    res.sendFile(path.resolve('views/meetingsAdmin.html'));
                }else{
                    res.sendFile(path.resolve('views/meetings.html'));
                }
            });
        });
    });

    app.get('/api/meetings', function (req, res) {
        Meeting.find({}, function(err, docs){
              res.json(docs);
        });
    });

    app.get('/api/meetings/:group_id', function (req, res) {
        if(!req.params.group_id) {
            res.sendStatus(400);
            return;
        }

        Meeting.find({ group: req.params.group_id }, function(err, docs){
            res.json(docs);
        });
    });
}

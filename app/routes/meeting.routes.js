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

    app.get('/meetings/:key', cas.bounce, function (req, res) {console.log("3");
        var rcsID = req.session.cas_user.toLowerCase();
        Group.findOne({"_id" : req.params.key}, function(err, group){
			console.log(group.admin+"admin");
			if(group["admin"] == rcsID){
				console.log(rcsID);
                res.sendFile(path.resolve('views/meetingsAdmin.html'));
            }else{
				console.log(rcsID+"member");
                res.sendFile(path.resolve('views/meetings.html'));
            }
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
    
    app.post('/api/meetings', function (req, res) {
        var info = req.body;

        var m = Meeting({
            name : info.name,
            pin : info.pin,
            group : info.group
        });
        m.save(function (err, saved) {
            if (err) {
                return console.error(err);
            }else{
                res.redirect('/meetings/' + info.group);
            }
        })
    });

    app.get('/createMeeting/:id', function (req, res) {
        if(!req.session.cas_user) {
            res.redirect('/auth');
        }

        res.sendFile(path.resolve('views/createMeeting.html'));
    });
}

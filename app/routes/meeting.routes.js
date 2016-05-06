var path    = require('path');
var config  = require('../../config.js');
var cms     = require('cms-api')(config.cms_api_token);
var Meeting = require('../models/meeting.model.js');
var Group   = require('../models/group.model.js');
var User    = require('../models/user.model.js');

module.exports = function(app, cas) {
    //check if user can see meetings
    app.get('/meetings', function (req, res) {
        if(!req.session.cas_user) {
            res.redirect('/auth');
        }
        res.redirect('/groups');
    });

    //for listing meetings
    app.get('/meetings/:key', cas.bounce, function (req, res) {
        //get rcsID
        var rcsID = req.session.cas_user.toLowerCase();

        //find the group
        Group.findOne({_id : req.params.key}, function(err, group){
            //show admin page if we are the admin, other page if not
			if(group["admin"] == rcsID){
                res.sendFile(path.resolve('views/meetingsAdmin.html'));
            }else{
                res.sendFile(path.resolve('views/meetings.html'));
            }
        });
    });

    //helper for getting meetings
    app.get('/api/meetings', function (req, res) {
        Meeting.find({}, function(err, docs){
              res.json(docs);
        });
    });

    //helper for getting meetings by group id
    app.get('/api/meetings/:group_id', function (req, res) {
        //send error if group_id not set
        if(!req.params.group_id) {
            res.sendStatus(400);
            return;
        }

        //send back relevant information
        Meeting.find({ group: req.params.group_id }, function(err, docs){
            res.json(docs);
        });
    });


    app.post('/api/meetings', function (req, res) {
        //variable
        var info = req.body;

        //schema
        var m = Meeting({
            name : info.name,
            pin : info.pin,
            group : info.group
        });

        //save database
        m.save(function (err, saved) {
            if (err) {
                return console.error(err);
            }else{
                res.redirect('/meetings/' + info.group);
            }
        })
    });

    //for creating meetings
    app.get('/createMeeting/:id', function (req, res) {
        if(!req.session.cas_user) {
            res.redirect('/auth');
        }

        res.sendFile(path.resolve('views/createMeeting.html'));
    });

    //for going back to the group from the create meetings page
    app.get('/cancel/:key', function (req, res){
        console.log(req.params.key);
        Meeting.find({}, function(resp){
            console.log(resp);
        });
    });
}

var path   = require('path');
var config = require('../../config.js');
var cms    = require('cms-api')(config.cms_api_token);
var Group  = require('../models/group.model.js');

module.exports = function(app, cas) {
    // app.get('/api/groups', function (req, res) {
    //     Group.find({}, function(err, docs){
    //         res.json(docs);
    //     });
    // });

    // app.get('/api/newGroups', function (req, res) {
    //     cms.getRCS(req.session.cas_user.toLowerCase()).then(function (response) {
    //         cms.getOrgs(JSON.parse(response)["student_id"]).then(function (docs){
    //             res.json(JSON.parse(docs));
    //         });
    //     });
    // });

    app.get('/api/groups', function (req, res) {
        var user = req.session.cas_user.toLowerCase();
        cms.getRCS(user).then(function (response) {
            cms.getOrgs(JSON.parse(response)["student_id"]).then(function (docs){
                var resp = JSON.parse(docs);
                resp.forEach(function(arr){
                    Group.findOne({ casEntity: arr.entity_id }, function(err, group) {
                        if (err) {
                            throw err;
                        }

                        // if group does not yet exist in db
                        if (!group) {
                            var g = Group({
                                name      : arr.name,
                                desc      : arr.description,
                                admin     : user,
                                casEntity : arr.entity_id,
                                allowed   : [user]
                            });

                            g.save(function (err, saved) {
                                if (err) {
                                    return console.log('error saving to db');
                                }else{
                                    console.log(arr.name);
                                }
                            });
                        }
                    });
                });
                Group.find({ $or: [{allowed: user}, {admin: user}] }, function (err, groups) {
                    res.json(groups);
                });
            });
        });
    });
}

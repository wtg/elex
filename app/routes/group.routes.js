var path   = require('path');
var Q      = require('q');
var config = require('../../config.js');
var cms    = require('cms-api')(config.cms_api_token);
var Group  = require('../models/group.model.js');

module.exports = function(app, cas) {
    app.get('/groups', function (req, res) {
        if(!req.session.cas_user) {
            res.redirect('/auth');
            return;
        }

        res.sendFile(path.resolve('views/main_menu.html'));
    });

    app.get('/api/groups', function (req, res) {
        if(!req.session.cas_user) {
            Group.find({}, function (err, groups) {
                res.json(groups);
            });
            return;
        }

        var user = req.session.cas_user.toLowerCase();
        var rin = '';

        var getAllOrgResults = Q.defer();
        var getOrgResults = Q.defer();

        cms.getRCS(user).then(function (response) {
            rin = JSON.parse(response)["student_id"];
            return cms.getAllOrgs(rin);
        }).then(function (docs) {
            var numProcessed = 0; // this ensures the data isn't returned until we're done
            var resp = JSON.parse(docs);

            resp.forEach(function(arr) {
                Group.findOne({ casEntity: arr.entity_id }).then(function (group) {
                    if(!group) {
                        console.log('NON ADMIN, NEW GROUP', arr.name);
                        Group({
                            name      : arr.name,
                            desc      : arr.description,
                            admin     : null,
                            casEntity : arr.entity_id,
                            allowed   : [user]
                        }).save(function (err, saved) {
                            numProcessed++;
                            if(numProcessed === resp.length) {
                                getAllOrgResults.resolve();
                            }
                        });
                    } else {
                        console.log('NON ADMIN, EXISTING GROUP', group.name);
                        if(group.allowed.indexOf(user) === -1) {
                            group.allowed.push(user);
                        }
                        Group.update({ _id : group._id }, { allowed: group.allowed }).then(function () {
                            numProcessed++;
                            if(numProcessed === resp.length) {
                                getAllOrgResults.resolve();
                            }
                        })
                    }
                }, function (err) {
                    throw err;
                });
            });

            return cms.getOrgs(rin);
        }).then(function (docs) {
            var numProcessed = 0; // this ensures the data isn't returned until we're done
            var resp = JSON.parse(docs);
            resp.forEach(function(arr) {
                Group.findOne({ casEntity: arr.entity_id }).then(function (group) {
                    if (!group) {
                        console.log('ADMIN, NEW GROUP', arr.name);
                        var g = Group({
                            name      : arr.name,
                            desc      : arr.description,
                            admin     : user,
                            casEntity : arr.entity_id,
                            allowed   : [user]
                        });

                        g.save(function (err, saved) {
                            if (err) {
                                console.err(err);
                            } else {
                                numProcessed++;
                                if(numProcessed === resp.length) {
                                    getOrgResults.resolve();
                                }
                            }
                        });
                    } else {
                        console.log('ADMIN, EXISTING GROUP', group.name);
                        if(!group.admin) {
                            group.admin = user;
                        }

                        if(group.allowed.indexOf(user) === -1) {
                            group.allowed.push(user);
                        }

                        Group.update({ _id : group._id }, { admin: group.admin, allowed: group.allowed }).then(function (data) {
                            numProcessed++;
                            if(numProcessed === resp.length) {
                                getOrgResults.resolve();
                            }
                        })
                    }
                }, function (err) {
                    throw err;
                });
            });
        });

        Q.all([
            getAllOrgResults,
            getOrgResults
        ]).then(function () {
            Group.find({ $or: [{allowed: user}, {admin: user}] }, function (err, groups) {
                res.json(groups);
            });
        });
    });

    app.get('/api/groups/:id', function (req, res) {
        if(!req.params.id) {
            res.sendStatus(400);
            return;
        }

        Group.findOne({ _id: req.params.id }, function (err, groups) {
            res.json(groups);
        });
    })

    // ALIAS FOR /api/groups/:id
    app.get('/api/group/:id', function (req, res) {
        res.redirect('/api/groups/' + req.params.id);
    })
}

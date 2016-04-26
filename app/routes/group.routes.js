var path = require('path');
var Group = require('../models/group.model.js');

module.exports = function(app, cas) {
    app.get('/api/groups', function (req, res) {
        Group.find({}, function(err, docs){
            res.json(docs);
        });
    });

    app.get('/api/newGroups', function (req, res) {
        cms.getRCS("etzinj").then(function (response) {
            cms.getOrgs(JSON.parse(response)["student_id"]).then(function (docs){
                res.json(JSON.parse(docs));
            });
        });
    });
}

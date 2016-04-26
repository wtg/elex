var path    = require('path');
var config  = require('../../config.js');
var cms     = require('cms-api')(config.cms_api_token);
var Meeting = require('../models/meeting.model.js');

module.exports = function(app, cas) {
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

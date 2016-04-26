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
}

// app/routes.js

// grab the nerd model we just created
var Example = require('./models/example.model.js');

module.exports = function(app) {
  // server routes ===========================================================
  // handle things like api calls
  // authentication routes

  // sample api route
  app.get('/api/example', function(req, res) {
    res.sendFile(__dirname + '../public/index.html');
  });

  app.get('/', function(req, res) {
    console.log("?QuestionMark");
  });

  // route to handle creating goes here (app.post)
  // route to handle delete goes here (app.delete)
};

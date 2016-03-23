// app/routes.js

// grab the nerd model we just created
var Example = require('./models/example.model.js');

module.exports = function(app) {
  // server routes ===========================================================
  // handle things like api calls
  // authentication routes

  // sample api route
  app.get('/api/example', function(req, res) {
    // use mongoose to get all example in the database
    Nerd.find(function(err, example) {

      // if there is an error retrieving, send the error.
      // nothing after res.send(err) will execute
      if (err)
      res.send(err);

      res.json(example); // return all example in JSON format
    });
  });

  // route to handle creating goes here (app.post)
  // route to handle delete goes here (app.delete)
};

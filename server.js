// server.js
// modules =================================================
var express           = require('express');
var app               = express();
var server            = require('http').Server(app);
var bodyParser        = require('body-parser');
var methodOverride    = require('method-override');
var session           = require('express-session');
var CASAuthentication = require('cas-authentication');
var mongoose          = require('mongoose');
var morgan            = require('morgan');
var config            = require('./config.js');
var cms               = require('cms-api')(config.cms_api_token);

// configuration ===========================================

//cms test
// cms.getRCS('villat2').then(function (response) {
//     console.log(response);
// });


//process.env['PORT'] = 2323;

// set our port
var port = process.env.PORT || 3000;
var ip = process.env.IP || "localhost";

// connect to our mongoDB database
// (uncomment after you enter in your own credentials in config/db.js)
mongoose.connect(require('./config/db')(ip));

// morgan route logger middleware
app.use(morgan('dev'));

// get all data/stuff of the body (POST) parameters
// parse application/json
app.use(bodyParser.json());

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override'));

// set the static files location (ex. /public/img will be /img for users)
app.use(express.static('public'));

// mongodb schemas
var User     = require('./app/models/user.model.js');
var Poll     = require('./app/models/poll.model.js');
var Meeting  = require('./app/models/meeting.model.js');
var Group    = require('./app/models/group.model.js');

//establish new session
app.use(session({
    secret            : 'super secret key',
    resave            : false,
    saveUninitialized : true
}));

var cas = new CASAuthentication({
    cas_url       : 'https://cas-auth.rpi.edu/cas',
    service_url   : 'http://' + (process.env.IP || 'localhost') + ':' + (process.env.PORT || '3000') + '/auth?'
    // , is_dev_mode   : true
    // , dev_mode_user : 'villat2'
});

app.get('/', function (req, res) {
    if (!req.session[cas.session_name]) {
        res.sendFile(__dirname + '/views/index.html');
    } else {
        res.redirect('/groups');
    }
})

app.get('/logout', cas.logout);

app.get('/executeCreation/:key', cas.block, function (req, res) {
    //change "etzinj" to "req.session.cas_user"
    //gets user's rin
    var rcsID = req.session.cas_user;
    cms.getRCS(rcsID).then(function (response) {
        //gets user's clubs
        return cms.getOrgs(JSON.parse(response)["student_id"])
    }).then(function (docs){
        //parses response from string to json
        var resp = JSON.parse(docs);
        resp.forEach(function(arr){
            if(arr.entity_id == req.params.key){
                var g = Group({
                    name  : arr.name,
                    desc  : arr.description,
                    admin : rcsID
                });
                g.save(function (err, saved) {
                    if (err) {
                        return console.log('error saving to db');
                    }else{
                        console.log(arr.name);
                    }
                })
                res.redirect('/groups');
                return;
            }
        });
        res.redirect('/createGroup');
    });
});

// routes ==================================================
require('./app/routes')(app);
require('./app/routes/user.routes')(app, cas);
require('./app/routes/group.routes')(app, cas);
require('./app/routes/meeting.routes')(app, cas);
require('./app/routes/poll.routes')(app, cas, server);

// start app ===============================================
server.listen(port, function(){
  console.log("Application currently listening on port " + port);
});

console.log(" ______ _      ________   __\n|  ____| |    |  ____\\ \\ \/ \/\n| |__  | |    | |__   \\ V \/ \n|  __| | |    |  __|   > <  \n| |____| |____| |____ \/ . \\ \n|______|______|______\/_\/ \\_\\\n");

console.log("Elex Voting System v1.0");

// expose app
exports = module.exports = app;

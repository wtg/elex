// server.js

// modules =================================================
var express           = require('express');
var app               = express();
var server            = require('http').Server(app);
var bodyParser        = require('body-parser');
var methodOverride    = require('method-override');
var io                = require('socket.io')(server);
var session           = require('express-session');
var CASAuthentication = require('cas-authentication');
var mongoose          = require('mongoose');
var config            = require('./config.js');
var cms               = require('cms-api')(config.cms_api_token);

// configuration ===========================================

//cms
cms.getRCS('villat2').then(function (response) {
    console.log(response);
});

//connect to mongodb
mongoose.connect('mongodb://localhost/elex');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;
// mongodb schemas
var user = new mongoose.Schema({
  name: String,
  ID: ObjectId
});
var vote = new mongoose.Schema({
  result: String,
  elect: Number,
  user: Number,
  ID: ObjectId
});
var election = new mongoose.Schema({
  name: String,
  desc: String,
  result: String,
  meeting: Number,
  ID: ObjectId
});
var meeting = new mongoose.Schema({
  name: String,
  date: Date,
  pin: Number,
  group: Number,
  ID: ObjectId
});
var group = new mongoose.Schema({
  name: String,
  desc: String,
  admin: Number,
  allowed: Array,
  ID: ObjectId
});
var users = mongoose.model('user', user);
var votes = mongoose.model('vote', vote);
var elections = mongoose.model('election', election);
var meetings = mongoose.model('meetings', meeting);
var groups = mongoose.model('group', group);

//establish new session
app.use( session({
    secret            : 'super secret key',
    resave            : false,
    saveUninitialized : true
}));

var cas = new CASAuthentication({
    cas_url      : 'https://cas-auth.rpi.edu/cas',
    service_url  : 'http://localhost:3000/auth?',
    cas_dev_mode : true
});

io.on('connection', function (socket) {
    //console.log(socket.request.client);
    // socket.emit('socket_req', socket.request.client);
    socket.on('my other event', function (data) {
        console.log(data.session[cas.session_name]);
    });

    //if user creates a group, add to the database
    socket.on('new group', function( info ){
        var g = groups({
            name : info.name,
            desc : info.desc
        });
        g.save(function (err, saved) {
            if (err) {
                return console.log('error saving to db');
            }else{
                console.log(info.desc);
            }
        })
    });

    //get all groups
    socket.on('fetch groups', function(){
        groups.find({}, function(err, docs){
            socket.emit('groups response', docs);
        });        
    });
});

// config files
var db = require('./config/db');

// set our port
var port = process.env.PORT || 3000;

// connect to our mongoDB database
// (uncomment after you enter in your own credentials in config/db.js)
// mongoose.connect(db.url);

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

app.get('/auth', cas.bounce, function ( req, res ) {

    //gets your rcsid from cas
    var rcsID = req.session[cas.session_name];

    //searches to see if rcsID is already in db
    users.findOne({'name' : rcsID}, function(err, user){
        if(err){ console.log(err); }
        else if(!user){
            var u = new users({
                name : rcsID
            });
            u.save(function (err, saved) {
                if (err) {
                    return console.log('error saving to db');
                }else{
                    console.log("please?");
                }
            })
        }
    });
    res.sendFile(__dirname + '/public/main_menu.html');
});

app.get('/logout', cas.logout);

app.get('/vote', cas.bounce, function ( req, res ) {
    res.sendFile(__dirname + '/public/pin.html');
});

// routes ==================================================
require('./app/routes')(app); // configure our routes

// start app ===============================================
server.listen(port, function(){
  console.log("Application currently listening on port " + port);
});

console.log(" ______ _      ________   __\n|  ____| |    |  ____\\ \\ \/ \/\n| |__  | |    | |__   \\ V \/ \n|  __| | |    |  __|   > <  \n| |____| |____| |____ \/ . \\ \n|______|______|______\/_\/ \\_\\\n");

console.log("Elex Voting System v1.0");

// expose app
exports = module.exports = app;

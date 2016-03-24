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

// configuration ===========================================

app.use( session({
    secret            : 'super secret key',
    resave            : false,
    saveUninitialized : true
}));

var cas = new CASAuthentication({
    cas_url     : 'https://cas-auth.rpi.edu/cas',
    service_url : 'http://localhost:3000/auth?'
});

io.on('connection', function (socket) {
  //console.log(socket.request.client);
  // socket.emit('socket_req', socket.request.client);
  socket.on('my other event', function (data) {
    console.log(data);
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
    res.sendFile(__dirname + '/public/main_menu.html');
});

app.get('/vote', cas.bounce, function ( req, res ) {
    res.sendFile(__dirname + '/public/main_menu.html');
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

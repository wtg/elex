module.exports = function (server) {
    var io = require('socket.io')(server);

    io.on('connection', function (socket) {
        socket.on('register meeting', function (meeting_id) {
            console.log(meeting_id);
        });

        socket.on('create vote', function (vote_data) {
            console.log(vote_data);
        })
    });
}

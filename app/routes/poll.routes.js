var path        = require('path');
var config      = require('../../config.js');
var cms         = require('cms-api')(config.cms_api_token);
var socketIO    = require('socket.io');
var path        = require('path');
var Meeting     = require('../models/meeting.model.js');
var Poll        = require('../models/poll.model.js');
var Participant = require('../models/participant.model.js');
var Group       = require('../models/group.model.js');
var User        = require('../models/user.model.js');

/**
 * Emits the details of an active vote to the client. Used when a vote is created
 * and when a socket connects while a vote is already active
 * @param socket  {} the active socket connecion
 * @param meeting {} the meeting details
 * @param poll    {} the poll details
 */
function emitPollActive(socket, meeting, poll) {
    socket.emit('poll active', {
        group_id:         meeting.group,
        meeting_id:       meeting._id,
        meeting_date:     meeting.date,
        poll_id:          meeting.activePollId,
        poll_name:        poll.name,
        poll_description: poll.description,
        poll_options:     poll.options
    });
}

module.exports = function (app, cas, server) {
    var io = socketIO(server);

    io.on('connection', function (socket) {
        console.log('CLIENT JOINED', socket.id);
        /**
         * Socket listener for when a socket joins a meeting. Should include an
         * object with the meeting_id and username.
         *
         * NOTE: each socket client MUST emit 'join meeting' with the appropriate
         *       data object in order to participate in votes.
         */
        socket.on('join meeting', function (details) {
            console.log('CLIENT INITIATED JOIN MEETING', details);

            // if invalid credentials
            if(!details || !details.meeting_id || !details.username) {
                socket.disconnect();
            }

            var p = new Participant({
                username: details.username,
                clientSocketID: socket.id,
                meeting_id: details.meeting_id
            });

            p.save(function (err, saved) {
                console.log('Socket ' + socket.id + ' successfully authenticated as ' + details.username + ' on meeting ' + details.meeting_id);

                Meeting.findOne({ _id: details.meeting_id }).then(function (meeting) {
                    // invalid meeting
                    if(!meeting) {
                        socket.disconnect();
                        return;
                    }

                    if(!meeting.activePollId) {
                        socket.emit('no poll active', {
                            group_id:     meeting.group,
                            meeting_id:   meeting._id,
                            meeting_date: meeting.date
                        });
                    } else {
                        Poll.findOne({ _id: meeting.activePollId }).then(function (poll) {
                            emitPollActive(socket, meeting, poll);
                        });
                    }
                });
            });
        });

        socket.on('create poll', function (poll_data) {
            console.log("ENTERED CREATE");
            if(!poll_data || !poll_data.name || !poll_data.description || !poll_data.options || !poll_data.username) {
                socket.emit('incomplete poll');
                return;
            }

            Participant.findOne({ clientSocketID: socket.id, username: poll_data.username }).then(function (participant) {
                if(!participant) {
                    socket.emit('not authorized');
                    return;
                }

                console.log("FOUND PARTICIPANT", participant);

                Meeting.findOne({ _id: participant.meeting_id }).then(function (meeting) {
                    // invalid meeting
                    if(!meeting) {
                        console.log("HERE", meeting);
                        socket.emit('not authorized');
                        return;
                    }

                    console.log("FOUND MEETING", meeting);

                    Group.findOne({ _id: meeting.group }).then(function (group) {
                        if(group.admin !== participant.username) {
                            socket.emit('not authorized');
                            return;
                        }

                        console.log("FOUND GROUP", group);

                        var p = new Poll({
                            meeting     : meeting._id,
                            name        : poll_data.name,
                            description : poll_data.description,
                            options     : poll_data.options
                        });

                        p.save(function (err, saved) {
                            if(err) { throw err; }
                            console.log("SAVED");
                            Meeting.update({ _id : meeting._id }, { activePollId: saved._id }).then(function (data) {
                                console.log(data);
                                emitPollActive(socket, meeting, saved);
                            });
                        });
                    }, function (err) {
                        console.error(err);
                    });
                }, function (err) {
                    console.error(err);
                });

                console.log("AFTER");
            }, function (err) {
                console.error(err);
            });
        });

        // TODO: receiver for closing a poll

        socket.on('submit vote', function (vote_data) {
            if(!vote_data || !vote_data.vote || !vote_data.username) {
                socket.emit('invalid vote');
                return;
            }

            Participant.findOne({ clientSocketID: socket.id, username: vote_data.username }).then(function (participant) {
                if(!participant) {
                    socket.emit('invalid vote');
                    return;
                }

                Meeting.findOne({ _id: participant.meeting_id }).then(function (meeting) {
                    // invalid meeting
                    if(!meeting || !meeting.activePollId) {
                        socket.emit('invalid vote');
                        return;
                    }

                    Vote.findOne({ username: vote_data.username, pollId: meeting.activePollId }).then(function (vote) {
                        if(vote) {
                            Vote.update({ _id : vote._id }, { val: vote_data.vote }).then(function (data) {
                                socket.emit('vote recorded');

                                // TODO: emit updated stats to admin
                                socket.emit('admin vote updated');
                            })
                        } else {
                            // case for new vote
                            var v = new Vote({
                                username: vote_data.username,
                                val:      vote_data.vote,
                                pollId:   meeting.activePollId
                            });

                            v.save(function (err, saved) {
                                socket.emit('vote recorded');

                                // TODO: emit updated stats to admin
                                socket.emit('admin vote updated');
                            });
                        }
                    });
                });
            });
        });
    });

	app.get('/createPoll/:key', cas.block, function (req, res) {
	    res.sendFile(path.resolve('views/createPoll.html'));
	});

	app.get('/polls/:key', cas.bounce, function (req, res) {
	    var rcsID = req.session.cas_user.toLowerCase();

    	Meeting.findOne({"_id" : req.params.key}, function(err, meet){
			console.log("meet: ");
    		Group.findOne({"_id" : meet.group}, function(err, group){
    			if(group.admin == rcsID){
    				res.sendFile(path.resolve('views/polls.html'));
    			}else{
    				res.sendFile(path.resolve('views/pin.html'));
    			}
    		});
    	});
	});
}

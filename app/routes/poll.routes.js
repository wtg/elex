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
var Vote        = require('../models/vote.model.js');

/**
 * Emits the details of an active vote to the client. Used when a vote is created
 * and when a socket connects while a vote is already active
 * @param socket  {} the active socket connecion
 * @param meeting {} the meeting details
 * @param poll    {} the poll details
 */
function emitPollActive(io, meeting) {
    console.log('emitPollActive1', meeting);
    Poll.findOne({ _id: meeting.activePollId }).then(function (poll) {
        console.log('emitPollActive2');
        Vote.find({ pollId: poll._id }).then(function (votes) {
            console.log('emitPollActive3', votes);
            var poll_results = {};
            var total_votes = 0;

            for(var i = 0; i < poll.options.length; i++) {
                poll_results[poll.options[i]] = 0;
            }

            for(var i = 0; i < votes.length; i++) {
                poll_results[votes[i].val]++;
                total_votes++;
            }

            io.sockets.emit('poll active', {
                group_id:         meeting.group,
                meeting_id:       meeting._id,
                meeting_date:     meeting.date,
                meeting_name:     meeting.name,
                poll_id:          meeting.activePollId,
                poll_name:        poll.name,
                poll_description: poll.description,
                poll_options:     poll.options,
                poll_results:     poll_results,
                total_votes:      total_votes
            });
        });
    });
}

function emitNoPollActive(io, meeting) {
    io.sockets.emit('no poll active', {
        group_id:     meeting.group,
        meeting_id:   meeting._id,
        meeting_name: meeting.name,
        meeting_date: meeting.date
    });
}

module.exports = function (app, cas, server) {
    var io = socketIO(server);

    io.on('connection', function (socket) {
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

                io.sockets.emit('admin socket authenticated', saved);

                Meeting.findOne({ _id: details.meeting_id }).then(function (meeting) {
                    // invalid meeting
                    if(!meeting) {
                        socket.disconnect();
                        return;
                    }

                    socket.emit('join successful', {
                        group_id: meeting.group,
                        meeting_id: meeting._id,
                        meeting_name: meeting.name
                    });

                    try {
                    if(!meeting.activePollId) {
                        emitNoPollActive(io, meeting);
                    } else {
                        emitPollActive(io, meeting);
                    }
                } catch(e) { console.log(e); }
                });
            });
        });

        socket.on('disconnect', function () {
            Participant.remove({ clientSocketID: socket.id }).then(function (participant) {
                io.sockets.emit('admin socket disconnected', socket.id);
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

                        var p = new Poll({
                            meeting     : meeting._id,
                            name        : poll_data.name,
                            description : poll_data.description,
                            options     : poll_data.options
                        });

                        p.save(function (err, saved) {
                            if(err) console.error(err);
                            Meeting.update({ _id : meeting._id }, { activePollId: saved._id }).then(function (data) {
                                console.log('EMITTING ACTIVE');
                                Meeting.findOne({ _id: meeting._id }).then(function (updated_meeting) {
                                    emitPollActive(io, updated_meeting);
                                })
                            });
                        });
                    }, function (err) {
                        console.error(err);
                    });
                }, function (err) {
                    console.error(err);
                });
            }, function (err) {
                console.error(err);
            });
        });

        socket.on('close poll', function (username) {
            Participant.findOne({ clientSocketID: socket.id, username: username }).then(function (participant) {
                if(!participant) {
                    socket.emit('not authorized');
                    return;
                }

                Meeting.update({ _id: participant.meeting_id }, { activePollId: null }).then(function (meeting) {
                    emitNoPollActive(io, meeting);
                })
            });
        });

        socket.on('request vote', function (username) {
            Participant.findOne({ clientSocketID: socket.id, username: username }).then(function (participant) {
                if(!participant) {
                    socket.emit('not authorized');
                    return;
                }

                Vote.findOne({ username: participant.username }).then(function (vote) {
                    socket.emit('vote recorded', vote.val);
                })
            });
        });

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
                                socket.emit('vote recorded', vote_data.vote);
                                io.sockets.emit('admin vote updated', {
                                    meeting_id: participant.meeting_id,
                                    new: vote_data.vote,
                                    old: vote.val
                                });
                            })
                        } else {
                            // case for new vote
                            var v = new Vote({
                                username: vote_data.username,
                                val:      vote_data.vote,
                                pollId:   meeting.activePollId
                            });

                            v.save(function (err, saved) {
                                socket.emit('vote recorded', saved.val);
                                saved.meeting_id = participant.meeting_id;
                                io.sockets.emit('admin vote added', saved);
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
			console.log('/polls/' + req.params.key, meet);
    		Group.findOne({"_id" : meet.group}, function(err, group) {
    			if(group.admin == rcsID) {
            	    res.sendFile(path.resolve('views/createPoll.html'));
    			} else {
    				res.sendFile(path.resolve('views/pin.html'));
    			}
    		});
    	});
	});

    app.get('/vote/:key', cas.block, function (req, res) {
        res.redirect('/polls/' + req.params.key);
    });

    app.post('/vote/:key', cas.block, function ( req, res ) {
        if (!req.body.pin || !req.params.key) {
            res.redirect('/joinvote')
            return;
        }

        res.sendFile(path.resolve('views/vote.html'));
    });

	app.get('/api/votes/:key', function (req, res) {
        Vote.find({pollId : req.params.key}, function(err, docs){
            res.json(docs);
        });
    });

    app.get('/view', function (req, res){
    	res.sendFile(path.resolve('views/view.html'));
    });
}

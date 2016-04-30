var mongoose = require('mongoose');

// Participants DB Model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('Participant', {
  clientSocketID : String,
  meetingID      : String,
  username       : String,
  ID             : ObjectId
});

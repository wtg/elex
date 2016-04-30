var mongoose = require('mongoose');

// Meeting DB Model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('Meeting', {
  name         : String,
  date         : Date,
  pin          : Number,
  group        : String,
  activePollId : { type: String, default: null },
  ID           : mongoose.Schema.ObjectId
});

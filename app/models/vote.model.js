var mongoose = require('mongoose');

// Vote DB Model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('Vote', {
  val      : String,
  pollId   : String,
  username : String,
  ID       : mongoose.Schema.ObjectId
});
